import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function FloatingAdminButton() {
  const [location, navigate] = useLocation();
  
  const { data: user } = useQuery<{ id: number; isAdmin: boolean }>({
    queryKey: ["/api/user"],
  });

  const isAdminRoute = location.startsWith('/admin');
  
  if (!user?.isAdmin || isAdminRoute) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/admin-stats-2025')}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all z-50"
      size="icon"
      title="Admin Dashboard"
    >
      <Shield className="h-6 w-6" />
    </Button>
  );
}
