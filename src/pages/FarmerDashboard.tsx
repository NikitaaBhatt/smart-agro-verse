import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { batchAPI, profileAPI, offerAPI, communityAPI, Batch, Offer } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Package, TrendingUp, Users, Plus, ExternalLink, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunityFeed } from "@/components/CommunityFeed";
import { AiAssistant } from "@/components/AiAssistant";

const FarmerDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [offerHistory, setOfferHistory] = useState<Offer[]>([]);

  const [newBatch, setNewBatch] = useState({
    crop_name: "",
    details: "",
    quantity_kg: "",
    price_per_kg: "",
    image_url: "",
    doc_url: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login?type=farmer");
      return;
    }

    if (user?.user_type !== "farmer") {
      toast.error("Access denied. Farmers only.");
      navigate("/login?type=farmer");
      return;
    }

    loadData();
  }, [isAuthenticated, user, navigate, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [myBatches, profile, farmerOffers, history] = await Promise.all([
        batchAPI.getMyBatches(user!.token),       // ✔ FIX: Only farmer’s batches
        profileAPI.getFarmerProfile(user!.token),
        offerAPI.getOffersForFarmer(user!.token), // ✔ pending + active offers
        offerAPI.getOfferHistory(user!.token)     // ✔ full offer history
      ]);

      setBatches(myBatches);
      setProfileData(profile);
      setOffers(farmerOffers);
      setOfferHistory(history);
    } catch (error: any) {
      toast.error(error.message || "Failed to load farmer dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await batchAPI.createBatch(user!.token, newBatch);
      toast.success("Batch created successfully!");
      setNewBatch({
        crop_name: "",
        details: "",
        quantity_kg: "",
        price_per_kg: "",
        image_url: "",
        doc_url: "",
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async (offerId: number) => {
    try {
      await offerAPI.acceptOffer(user!.token, offerId);
      toast.success("Offer accepted");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const rejectOffer = async (offerId: number) => {
    const reason = prompt("Enter reason for rejection:");

    if (!reason) {
      toast.error("Rejection reason required.");
      return;
    }

    try {
      await offerAPI.rejectOffer(user!.token, offerId, reason);
      toast.success("Offer rejected");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading || !user || user.user_type !== "farmer") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Total Batches</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{batches.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Active Listings</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {batches.filter((b) => !b.is_sold).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Verification Status</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>

            <CardContent>
              <p className="text-green-600 font-semibold">
                ✔ Your account is verified
              </p>

              <p className="text-sm text-muted-foreground mt-2">
                AgroSense verifies farmers and buyers to ensure trust and
                transparency in the supply chain.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="batches">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="batches">My Batches</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>

          </TabsList>

          {/* MY BATCHES */}
          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>My Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                ) : batches.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No batches yet.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {batches.map((batch) => (
                      <Card
                        key={batch.id}
                        className="border hover:border-primary"
                      >
                        <CardContent className="pt-6">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-bold">
                              {batch.crop_name}
                            </h3>
                            <Badge
                              variant={batch.is_sold ? "secondary" : "default"}
                            >
                              {batch.is_sold ? "Sold" : "Active"}
                            </Badge>
                          </div>

                          <p className="text-sm mt-1 text-muted-foreground">
                            {batch.details}
                          </p>

                          <div className="mt-4">
                            <p>
                              <b>Qty:</b> {batch.quantity_kg} kg
                            </p>
                            <p>
                              <b>Price:</b> ₹{batch.price_per_kg}/kg
                            </p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(batch.polygonscan_url, "_blank")
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Blockchain
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/scan/${batch.id}`)}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OFFERS TAB (NEW) */}
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>Offers Received</CardTitle>
              </CardHeader>

              <CardContent>
                {offers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">
                    No pending offers.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {offers
                      .filter((o) => !o.is_accepted && !o.is_rejected)
                      .map((offer) => (
                        <Card
                          key={offer.id}
                          className="border hover:border-primary p-4"
                        >
                          <div className="flex justify-between">
                            <div>
                              <p>
                                <b>Batch ID:</b> {offer.batch_id}
                              </p>
                              <p>
                                <b>Buyer:</b>{" "}
                                {offer.buyer?.name || "Unknown Buyer"}{" "}
                              </p>
                              <p>
                                <b>Offered Price:</b> ₹{offer.offered_price}
                              </p>
                              <p>
                                <b>Status:</b>{" "}
                                {offer.is_accepted
                                  ? "Accepted"
                                  : offer.is_rejected
                                    ? "Rejected"
                                    : "Pending"}
                              </p>
                            </div>

                            {!offer.is_accepted && !offer.is_rejected && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => acceptOffer(offer.id)}
                                  className="bg-green-600 text-white"
                                >
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => rejectOffer(offer.id)}
                                  variant="destructive"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Offer History */}
                <div className="mt-10">
                  <h2 className="text-xl font-bold mb-3">Offer History</h2>

                  {offerHistory.length === 0 ? (
                    <p className="text-muted-foreground">
                      No offer history yet.
                    </p>
                  ) : (
                    offerHistory
                      .filter((o) => o.is_accepted || o.is_rejected)
                      .map((offer) => (
                        <Card key={offer.id} className="p-4 my-2 border">
                          <p>
                            <b>Batch ID:</b> {offer.batch_id}
                          </p>
                          <p>
                            <b>Buyer:</b>{" "}
                            {offer.buyer?.name || "Unknown Buyer"}{" "}
                          </p>
                          <p>
                            <b>Price:</b> ₹{offer.offered_price}
                          </p>
                          <p>
                            <b>Status:</b>{" "}
                            {offer.is_accepted
                              ? "Accepted"
                              : offer.is_rejected
                                ? "Rejected"
                                : "Pending"}
                          </p>
                          {offer.reject_reason && (
                            <p>
                              <b>Reason:</b> {offer.reject_reason}
                            </p>
                          )}
                        </Card>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CREATE BATCH TAB */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Batch</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div>
                    <Label>Crop Name</Label>
                    <Input
                      value={newBatch.crop_name}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, crop_name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Quantity (kg)</Label>
                    <Input
                      type="number"
                      value={newBatch.quantity_kg}
                      onChange={(e) =>
                        setNewBatch({
                          ...newBatch,
                          quantity_kg: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Price per kg (₹)</Label>
                    <Input
                      type="number"
                      value={newBatch.price_per_kg}
                      onChange={(e) =>
                        setNewBatch({
                          ...newBatch,
                          price_per_kg: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Details</Label>
                    <Textarea
                      value={newBatch.details}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, details: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={newBatch.image_url}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, image_url: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Document URL</Label>
                    <Input
                      value={newBatch.doc_url}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, doc_url: e.target.value })
                      }
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Create Batch"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMUNITY TAB */}
          <TabsContent value="community">
            <CommunityFeed />
          </TabsContent>

          {/* PROFILE TAB */}
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
                    Verified Farmer
                  </span>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
            <AiAssistant />
      </div>
    </div>
  );
};

export default FarmerDashboard;
