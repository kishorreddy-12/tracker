import { ComingSoon } from "@/components/ui/coming-soon";

const Settings = () => {
  return (
    <ComingSoon
      title="Settings"
      description="App settings and configuration options are coming soon."
      features={[
        "User profile management",
        "Notification preferences", 
        "Data export/import",
        "Theme customization",
        "Backup and sync settings",
        "Security preferences"
      ]}
      expectedDate="Q2 2024"
    />
  );
};

export default Settings;