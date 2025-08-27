import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOffline } from "@/hooks/useOffline";
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  RefreshCw, 
  Database,
  AlertCircle
} from "lucide-react";

export function OfflineIndicator() {
  const { 
    isOnline, 
    isInitialized, 
    syncInProgress, 
    pendingItems, 
    triggerSync,
    clearOfflineData 
  } = useOffline();

  if (!isInitialized) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Initializing...
      </Badge>
    );
  }

  const getStatusColor = () => {
    if (!isOnline) return "destructive";
    if (syncInProgress) return "secondary";
    if (pendingItems > 0) return "outline";
    return "default";
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (syncInProgress) return "Syncing...";
    if (pendingItems > 0) return `${pendingItems} pending`;
    return "Online";
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (syncInProgress) return <Loader2 className="h-3 w-3 animate-spin" />;
    if (pendingItems > 0) return <AlertCircle className="h-3 w-3" />;
    return <Wifi className="h-3 w-3" />;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant={getStatusColor()} 
          className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Connection Status</h4>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Offline</span>
                </>
              )}
            </div>
          </div>

          {pendingItems > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Offline Data</h4>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {pendingItems} item{pendingItems !== 1 ? 's' : ''} waiting to sync
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Actions</h4>
            <div className="flex gap-2">
              {isOnline && pendingItems > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={triggerSync}
                  disabled={syncInProgress}
                  className="gap-1"
                >
                  {syncInProgress ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Sync Now
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={clearOfflineData}
                disabled={syncInProgress}
                className="gap-1"
              >
                <Database className="h-3 w-3" />
                Clear Cache
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {!isOnline && (
              <p>You're working offline. Changes will be saved locally and synced when connection is restored.</p>
            )}
            {isOnline && pendingItems === 0 && (
              <p>All data is synced and up to date.</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}