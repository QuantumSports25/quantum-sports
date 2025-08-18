import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  createVenue,
  getAllVenuesByPartner,
  updateVenue,
  deleteVenue,
} from "../../services/partner-service/venue-service/venueService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import VenueCard from "../../components/common/venue/venueCard";
import EditableVenueCard from "../../components/common/venue/EditableVenueCard";
import { Venue } from "../../types";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import AddCart, { VenueFormData } from "./components/venue/AddCart";
import { useAuthStore } from "../../store/authStore";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import VenueDetailsManagement from "./components/venue/VenueDetailsManagement";
import { VenuePlanModal } from "../../components/modals";
import membershipService, { MembershipPlan as APIMembershipPlan } from "../../services/membershipService";

const UnauthorizedView: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md w-full text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-gray-400 mb-4">
        You must be logged in as a partner to view this page.
      </p>
      <button
        onClick={() => window.location.href = '/partner/login'}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Partner Login
      </button>
    </div>
  </div>
);

const PartnerVenues: React.FC = () => {
  const [isAddCartOpen, setIsAddCartOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingVenue, setDeletingVenue] = useState<{ id: string; name: string } | null>(null);
  const [selectedVenueForDetails, setSelectedVenueForDetails] = useState<Venue | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPurchasingPlan, setIsPurchasingPlan] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const isAuthorized = user && user.role === 'partner' && user.partnerDetails?.id;
  const partnerId = user?.id;

  const {
    data: venues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["venues", partnerId],
    queryFn: () => partnerId ? getAllVenuesByPartner(partnerId) : Promise.resolve([]),
    enabled: !!partnerId,
  });

  const createVenueMutation = useMutation({
    mutationFn: async (venueData: VenueFormData) => {
      if (!partnerId) throw new Error("No partner ID available");
      const dataWithPartnerId = {
        ...venueData,
        partnerId,
      };
      return createVenue(dataWithPartnerId);
    },
    onSuccess: () => {
      setIsAddCartOpen(false);
      queryClient.invalidateQueries({ queryKey: ["venues", partnerId] });
      toast.success("Venue created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating venue:", error);
      toast.error(error?.response?.data?.message || "Failed to create venue");
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: async (venue: Venue) => {
      if (!venue.id) throw new Error("Venue ID is required for update");
      return updateVenue(venue.id, venue);
    },
    onSuccess: () => {
      handleCloseEditModal();
      queryClient.invalidateQueries({ queryKey: ["venues", partnerId] });
      toast.success("Venue updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating venue:", error);
      toast.error(error?.response?.data?.message || "Failed to update venue");
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      return deleteVenue(venueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues", partnerId], exact: true });
      toast.success("Venue deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting venue:", error);
      toast.error(error?.response?.data?.message || "Failed to delete venue");
    },
  });

  const handleAddVenue = (data: VenueFormData) => {
    console.log("data", data);
    createVenueMutation.mutate(data);
  };

  const handleOpenAddCart = () => {
    setIsPlanModalOpen(true);
  };

  const handleCloseAddCart = () => {
    setIsAddCartOpen(false);
  };

  const handleSelectMonthlyPlan = async () => {
    try {
      if (!user?.id) {
        toast.error("Please login to continue.");
        return;
      }
      setIsPurchasingPlan(true);
      setIsPlanModalOpen(false);

      // 1) Fetch active membership plans and find partner membership
      const plansResp = await membershipService.getMembershipPlans();
      if (!plansResp.success || !Array.isArray(plansResp.data)) {
        throw new Error("Unable to fetch plans");
      }
      const partnerPlan: APIMembershipPlan | undefined =
        plansResp.data.find((p) => p.name.toLowerCase() === "partner membership") ||
        plansResp.data.find((p) => p.name.toLowerCase().includes("partner"));
      if (!partnerPlan) {
        throw new Error("Partner membership plan not found");
      }

      // 2) Create membership record
      const membershipResp = await membershipService.createMembership({
        userId: user.id,
        planId: partnerPlan.id,
      });
      if (!membershipResp.success || !membershipResp.id) {
        throw new Error("Failed to create membership record");
      }

      // 3) Create Razorpay order
      const orderResp = await membershipService.createMembershipOrder(membershipResp.id, {
        amount: partnerPlan.amount,
        userId: user.id,
        planId: partnerPlan.id,
      });
      if (!orderResp.success || !orderResp.data?.id) {
        throw new Error("Failed to create payment order");
      }

      // 4) Ensure Razorpay is loaded
      const ensureRazorpay = () => new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });
      await ensureRazorpay();

      const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!keyId) throw new Error("Razorpay key not configured");

      // 5) Open Razorpay
      const options = {
        key: keyId,
        amount: partnerPlan.amount * 100,
        currency: "INR",
        name: "Quantum Sports",
        description: `${partnerPlan.name}`,
        order_id: orderResp.data.id,
        handler: async (response: any) => {
          try {
            const verifyResp = await membershipService.verifyMembershipPayment({
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderId: response.razorpay_order_id,
              membershipId: membershipResp.id,
            });
            if (!verifyResp.success) throw new Error("Verification failed");
            toast.success("Plan activated. You can now add a venue.");
            setIsAddCartOpen(true);
          } catch (err: any) {
            toast.error(err?.message || "Payment verification failed");
          } finally {
            setIsPurchasingPlan(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled");
            setIsPurchasingPlan(false);
          },
        },
      } as any;

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        toast.error(`Payment failed: ${resp?.error?.description || "Unknown error"}`);
        setIsPurchasingPlan(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to start payment");
      setIsPurchasingPlan(false);
    }
  };

  const handleSelectRevenueShare = () => {
    setIsPlanModalOpen(false);
    // Open mailto to connect with sales team
    window.location.href = "mailto:sales@quantumsports.com?subject=Revenue%20Share%20Inquiry&body=Hi%20Quantum%20Sports%20Team,%0D%0A%0D%0AI'd%20like%20to%20discuss%20the%20revenue%20share%20plan%20for%20adding%20my%20venue.%20Please%20reach%20out%20to%20me.%0D%0A%0D%0AThanks,";
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setIsEditModalOpen(true);
  };

  const handleDeleteVenue = (venueId: string) => {
    deleteVenueMutation.mutate(venueId);
    setDeletingVenue(null);
  };

  const handleSaveVenue = (updatedVenue: Venue) => {
    updateVenueMutation.mutate(updatedVenue);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingVenue(null);
  };

  const handleViewVenueDetails = (venue: Venue) => {
    setSelectedVenueForDetails(venue);
  };

  const handleCloseVenueDetails = () => {
    setSelectedVenueForDetails(null);
  };

  if (!isAuthorized) {
    return <UnauthorizedView />;
  }

  // Show venue details management if a venue is selected
  if (selectedVenueForDetails) {
    return (
      <DashboardLayout userRole="partner">
        <VenueDetailsManagement
          venue={selectedVenueForDetails}
          onBack={handleCloseVenueDetails}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="partner">
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Partner Venues</h1>
            <p className="text-gray-400 mt-1">
              Monitor your venue performance and bookings
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenAddCart}
              disabled={createVenueMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createVenueMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>
                {createVenueMutation.isPending ? "Creating..." : "Add Venue"}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-gray-400">Loading venues...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-6 max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-500 mb-2">Failed to Load Venues or No Venues</h3>
            {/* <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'There was an error loading your venues. Please try again.'}
            </p> */}
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <span>Try Again or Add Venues</span>
              </button>
              <p className="text-sm text-gray-500">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && !error && venues && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: Venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onEdit={() => handleEditVenue(venue)}
                onDelete={() => venue.id && setDeletingVenue({ id: venue.id, name: venue.name })}
                onView={() => handleViewVenueDetails(venue)}
                showViewButton={true}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!venues || venues.length === 0) && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Venues Yet
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Start by adding your first venue. Add details like location, pricing, and images to attract more bookings.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleOpenAddCart}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Venue</span>
              </button>
              <a
                href="/help/venues"
                className="block text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                Learn more about managing venues →
              </a>
            </div>
          </div>
        )}

        {/* Add Venue Modal */}
        <VenuePlanModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectMonthly={handleSelectMonthlyPlan}
          onSelectRevenueShare={handleSelectRevenueShare}
        />

        <AddCart
          isOpen={isAddCartOpen}
          onClose={handleCloseAddCart}
          onSubmit={handleAddVenue}
          isLoading={createVenueMutation.isPending}
        />

        {/* Edit Venue Modal */}
        {editingVenue && (
          <EditableVenueCard
            venue={editingVenue}
            onSave={handleSaveVenue}
            onCancel={handleCloseEditModal}
            isOpen={isEditModalOpen}
            isLoading={updateVenueMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!deletingVenue}
          onClose={() => setDeletingVenue(null)}
          onConfirm={() => deletingVenue?.id && handleDeleteVenue(deletingVenue.id)}
          title="Delete Venue"
          message={`Are you sure you want to delete "${deletingVenue?.name}"? This action cannot be undone and will remove all associated data including bookings, activities, and facilities.`}
          isLoading={deleteVenueMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default PartnerVenues;
