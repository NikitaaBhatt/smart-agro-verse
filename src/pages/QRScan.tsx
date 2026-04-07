import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { batchAPI } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ExternalLink, CheckCircle, Shield, User, Package, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const QRScan = () => {
  const { batchId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (batchId) {
      loadBatchData();
    }
  }, [batchId]);

  const loadBatchData = async () => {
    setLoading(true);
    try {
      const result = await batchAPI.getPublicBatch(parseInt(batchId!));
      setData(result);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-earth">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-earth p-4">
        <Card className="max-w-md w-full shadow-card">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-muted-foreground">Batch not found</p>
            <Link to="/">
              <Button className="mt-4 gradient-blockchain">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { batch, farmer,buyer, blockchain_proof } = data;
  const qrUrl = `${window.location.origin}/scan/${batch.id}`;

  return (
    <div className="min-h-screen gradient-earth py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="shadow-glow border-2 border-primary mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <div className="p-4 bg-background rounded-lg">
                  <QRCodeSVG value={qrUrl} size={200} />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                  <Badge variant="default" className="text-sm gradient-blockchain">
                    Blockchain Verified
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2 text-foreground">{batch.crop_name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{data?.batch?.details}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-xl font-bold text-foreground">{data?.batch?.quantity} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold text-primary">₹{data?.batch?.price}/kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={batch.is_sold ? "secondary" : "default"}>
                      {batch.is_sold ? "Sold" : "Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Layout for Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Farmer Information */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Farmer Details</h2>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-medium text-foreground">{farmer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg text-foreground">{farmer.email}</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-primary font-medium">Verified Farmer</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch Information */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Batch Information</h2>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Batch ID</p>
                  <p className="text-lg font-mono font-medium text-foreground">#{batch.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created On</p>
                  <p className="text-lg text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(batch.created_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Address</p>
                  <p className="text-sm font-mono text-foreground break-all">{blockchain_proof.contract_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Proof */}
        <Card className="shadow-card mt-6 gradient-blockchain">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
              <h2 className="text-2xl font-bold text-primary-foreground">Blockchain Proof</h2>
            </div>
            <Separator className="mb-4 bg-primary-foreground/20" />
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary-foreground/80">Transaction Hash</p>
                <p className="text-sm font-mono text-primary-foreground break-all">{blockchain_proof.tx_hash}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-primary-foreground/80">Recorded On</p>
                  <p className="text-lg font-medium text-primary-foreground">
                    {new Date(batch.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/80">Last Price</p>
                  <p className="text-lg font-medium text-primary-foreground">₹{blockchain_proof.last_price}/kg</p>
                </div>
              </div>

              <Button
                className="w-full bg-background text-primary hover:bg-background/90 shadow-glow"
                onClick={() => window.open(blockchain_proof.polygonscan_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Polygon Amoy Explorer
              </Button>
            </div>
          </CardContent>
        </Card>

            {/* Supply Chain Timeline */}

<Card className="shadow-card mt-6">
  <CardContent className="pt-6">

    <h2 className="text-2xl font-bold mb-4 text-foreground">
      Supply Chain Timeline
    </h2>

    <Separator className="mb-4" />

    <div className="space-y-4 text-lg">

      {/* Farmer Created Batch */}

      <div className="flex items-center gap-3">
        <span>🌾</span>
        <span>
          Farmer <b>{farmer?.name}</b> created batch
        </span>
      </div>

      {/* Listed */}

      <div className="flex items-center gap-3">
        <span>📦</span>
        <span>
          Listed on AgroSense marketplace
        </span>
      </div>

      {/* Buyer Purchase */}

      {buyer?.name && (
        <div className="flex items-center gap-3">
          <span>💰</span>
          <span>
            Purchased by <b>{buyer.name}</b>
          </span>
        </div>
      )}

      {/* Blockchain */}

      <div className="flex items-center gap-3">
        <span>🔗</span>
        <span>
          Ownership recorded on Polygon blockchain
        </span>
      </div>

    </div>

  </CardContent>
</Card>

        {/* Additional Info */}
        <Card className="shadow-card mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This batch is permanently recorded on the Polygon Amoy blockchain, ensuring complete transparency and traceability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="outline">Browse More Batches</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-blockchain shadow-glow">Join AgroSense</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScan;
