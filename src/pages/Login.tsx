import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Leaf, Loader2 } from "lucide-react";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const defaultTab = searchParams.get("type") === "buyer" ? "buyer" : "farmer";

  const [farmerData, setFarmerData] = useState({ email: "", password: "" });
  const [buyerData, setBuyerData] = useState({ email: "", password: "" });

  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authAPI.loginFarmer(farmerData);
      login(user);
      toast.success("Welcome back, Farmer!");
      navigate("/farmer-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authAPI.loginBuyer(buyerData);
      login(user);
      toast.success("Welcome back, Buyer!");
      navigate("/buyer-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-earth">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full gradient-blockchain flex items-center justify-center shadow-glow">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Login to your AgroSense account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="farmer">Farmer</TabsTrigger>
              <TabsTrigger value="buyer">Buyer</TabsTrigger>
            </TabsList>

            <TabsContent value="farmer">
              <form onSubmit={handleFarmerLogin} className="space-y-4">
                <div>
                  <Label htmlFor="farmer-email">Email</Label>
                  <Input
                    id="farmer-email"
                    type="email"
                    value={farmerData.email}
                    onChange={(e) => setFarmerData({ ...farmerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="farmer-password">Password</Label>
                  <Input
                    id="farmer-password"
                    type="password"
                    value={farmerData.password}
                    onChange={(e) => setFarmerData({ ...farmerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-blockchain shadow-glow" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login as Farmer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="buyer">
              <form onSubmit={handleBuyerLogin} className="space-y-4">
                <div>
                  <Label htmlFor="buyer-email">Email</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    value={buyerData.email}
                    onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-password">Password</Label>
                  <Input
                    id="buyer-password"
                    type="password"
                    value={buyerData.password}
                    onChange={(e) => setBuyerData({ ...buyerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-blockchain shadow-glow" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login as Buyer"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
