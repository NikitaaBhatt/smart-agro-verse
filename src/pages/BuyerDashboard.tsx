import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { batchAPI, offerAPI, profileAPI, purchaseAPI, Batch, Offer } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Package, TrendingUp, ExternalLink, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityFeed } from "@/components/CommunityFeed";

const BuyerDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [offerPrice, setOfferPrice] = useState("");

  // --------------------------------------
  // AUTH CHECK
  // --------------------------------------
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login?type=buyer");
      return;
    }

    if (user?.user_type !== "buyer") {
      toast.error("Access denied. Only buyers allowed.");
      navigate("/login?type=buyer");
      return;
    }

    loadData();
  }, [user, isAuthenticated, authLoading]);

  // --------------------------------------
  // LOAD DATA
  // --------------------------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const [batchesData, profile,offers] = await Promise.all([
        batchAPI.listBatches(),
        profileAPI.getBuyerProfile(user!.token),
        offerAPI.getBuyerOffers(user!.token),
        //purchaseAPI.listBuyerPurchases(user!.token),
        
      ]);

      setBatches(batchesData);
      setProfileData(profile);
      setMyOffers(offers);
      //setMyPurchases(purchases);
      setMyPurchases(offers.filter((o:Offer) => o.is_accepted));
    } catch (e: any) {
      toast.error("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // MAKE OFFER
  // --------------------------------------
  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);
    try {
      await offerAPI.createOffer(user!.token, {
        batch_id: selectedBatch.id,
        offered_price: offerPrice,
      });
      toast.success("Offer submitted!");
      setOfferPrice("");
      setSelectedBatch(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit offer");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // PAYMENT FLOW
  // --------------------------------------
  

  const activeBatches = batches.filter((b) => !b.is_sold);

  // --------------------------------------
  // LOADING SCREEN
  // --------------------------------------
  if (authLoading || !user || user.user_type !== "buyer") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --------------------------------------
  // RENDER
  // --------------------------------------
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Available Batches</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBatches.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>My Offers</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myOffers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Total Purchases</CardTitle>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myPurchases.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <Tabs defaultValue="marketplace">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="offers">My Offers</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          </TabsList>

          {/* -------------------------------------------------------
               MARKETPLACE (Active Batches)
          -------------------------------------------------------- */}
          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Available Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                ) : activeBatches.length === 0 ? (
                  <p className="text-center mt-10">No batches available.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {activeBatches.map((batch) => (
                      <Card
                        key={batch.id}
                        className="p-4 border hover:border-primary"
                      >
                        <h3 className="text-xl font-bold">{batch.crop_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {batch.details}
                        </p>

                        <div className="mt-4 space-y-1">
                          <p>
                            <b>Quantity:</b> {batch.quantity_kg} kg
                          </p>
                          <p>
                            <b>Price:</b> ₹{batch.price_per_kg}/kg
                          </p>

                          {batch.farmer && (
                            <p>
                              <b>Farmer:</b> {batch.farmer.name}
                            </p>
                          )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-2 mt-4">
                          {/* MAKE OFFER BUTTON */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="flex-1 gradient-blockchain"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setOfferPrice(batch.price_per_kg);
                                }}
                              >
                                Make Offer
                              </Button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Make an Offer</DialogTitle>
                              </DialogHeader>

                              <form
                                onSubmit={handleMakeOffer}
                                className="space-y-4"
                              >
                                <div>
                                  <Label>Crop</Label>
                                  <p className="font-medium">
                                    {selectedBatch?.crop_name}
                                  </p>
                                </div>

                                <div>
                                  <Label>Offer Price (₹/kg)</Label>
                                  <Input
                                    type="number"
                                    value={offerPrice}
                                    onChange={(e) =>
                                      setOfferPrice(e.target.value)
                                    }
                                    required
                                  />
                                </div>

                                <Button
                                  type="submit"
                                  className="w-full gradient-blockchain"
                                >
                                  Submit Offer
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {/* BLOCKCHAIN LINK */}
                          <Button
                            variant="outline"
                            onClick={() => window.open(batch.polygonscan_url)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" /> Verify
                          </Button>

                          {/* QR */}
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/scan/${batch.id}`)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------------------------------------
               MY OFFERS TAB
          -------------------------------------------------------- */}
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>My Offers</CardTitle>
              </CardHeader>

              <CardContent>
                {myOffers.length === 0 ? (
                  <p className="text-center py-10">
                    You have not made any offers yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myOffers.map((offer: any) => (
                      <Card key={offer.id} className="p-4 border">
                        <p>
                          <b>Batch:</b> {offer.batch?.crop_name}
                        </p>

                        {offer.batch?.farmer && (
                          <p>
                          <b>Farmer:</b> {offer.batch.farmer.name}
                          </p>
                          )}
                        

                        <p>
                          <b>Your Offer:</b> ₹{offer.offered_price}
                        </p>

                        {/* STATUS */}
                        <p>
                          <b>Status:</b>{" "}
                          {offer.is_rejected
                            ? "Rejected"
                            : offer.is_accepted
                              ? "Accepted"
                              : "Pending"}
                        </p>

                        {/* REJECTION REASON */}
                        {offer.reject_reason && (
                          <p className="text-red-600">
                            <b>Reason:</b> {offer.reject_reason}
                          </p>
                        )}

                        {/* ACCEPTED OFFER */}
                        {offer.is_accepted && (
                          <div className="mt-3 flex gap-3 items-center">
                            <Badge className="bg-green-600">
                              Accepted by Farmer
                            </Badge>

                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(`/scan/${offer.batch?.id}`)
                              }
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Track Supply Chain
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>My Purchases</CardTitle>
              </CardHeader>

              <CardContent>
                {myPurchases.length === 0 ? (
                  <p className="text-center py-10">No purchases yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myPurchases.map((purchase: any) => (
                      <Card key={purchase.id} className="p-4 border">
                        <p>
                          <b>Crop:</b> {purchase.batch?.crop_name}
                        </p>

                        {purchase.batch?.farmer && (
                         <p>
                            <b>Farmer:</b> {purchase.batch.farmer.name}
                         </p>
                        )}

                        <p>
                          <b>Quantity:</b> {purchase.batch?.quantity_kg} kg
                        </p>

                        <p>
                          <b>Price:</b> ₹{purchase.offered_price}/kg
                        </p>

                        <p>
                          <b>Status:</b> Purchased
                        </p>

                        <Button
                          variant="outline"
                          className="mt-3"
                          onClick={() =>
                            navigate(`/scan/${purchase.batch?.id}`)
                          }
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Track Supply Chain
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------------------------------------
               COMMUNITY
          -------------------------------------------------------- */}
          <TabsContent value="community">
            <CommunityFeed />
          </TabsContent>

          {/* -------------------------------------------------------
               PROFILE
          -------------------------------------------------------- */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <b>Name:</b> {user.name}
                </p>
                <p>
                  <b>Email:</b> {user.email}
                </p>
                <p>
                  <b>Phone:</b> {user.phone}
                </p>
                <p>
                  <b>Status:</b>{" "}
                  <span className="text-green-600 font-semibold">
                     Verified Buyer
                  </span>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuyerDashboard;
