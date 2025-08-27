import { ComingSoon } from "@/components/ui/coming-soon";

const Analytics = () => {
  return (
    <ComingSoon
      title="Advanced Analytics"
      description="Detailed analytics and insights for your seed organization business."
      features={[
        "Payment trend analysis",
        "Suborganizer performance metrics",
        "Seasonal comparison reports",
        "Profit margin calculations",
        "Predictive analytics",
        "Custom dashboard widgets"
      ]}
      expectedDate="Q3 2024"
    />
  );
};

export default Analytics;