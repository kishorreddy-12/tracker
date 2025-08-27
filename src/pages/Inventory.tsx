import { ComingSoon } from "@/components/ui/coming-soon";

const Inventory = () => {
  return (
    <ComingSoon
      title="Inventory Management"
      description="Track and manage your seed inventory, stock levels, and distribution."
      features={[
        "Seed stock tracking",
        "Inventory alerts and notifications",
        "Distribution management",
        "Supplier management",
        "Quality control tracking",
        "Batch and lot management"
      ]}
      expectedDate="Q4 2024"
    />
  );
};

export default Inventory;