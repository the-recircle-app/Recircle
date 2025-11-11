import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useWallet } from "../context/WalletContext";

export function FloatingAdminButton() {
  const [location, navigate] = useLocation();
  const { userId } = useWallet();
  
  const { data: user } = useQuery<{ id: number; isAdmin: boolean }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const isAdminRoute = location.startsWith('/admin');
  
  if (!user?.isAdmin || isAdminRoute) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/admin-stats-2025')}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all z-50 bg-purple-600 hover:bg-purple-700"
      size="icon"
      title="Admin Dashboard"
    >
      <Shield className="h-6 w-6" />
    </Button>
  );
}
