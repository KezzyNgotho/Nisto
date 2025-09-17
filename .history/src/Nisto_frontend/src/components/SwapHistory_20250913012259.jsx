import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  History, 
  ArrowRight, 
  TrendingDown, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  ArrowRightLeft,
  Info,
  DollarSign,
  Timer,
  Zap,
  Filter
} from 'lucide-react';

const SwapHistory = ({ swapHistory = [], isLoading = false }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const formatAmount = (amount, decimals = 2) => {
    return amount.toFixed(decimals);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === 'bigint') {
      const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
      return date.toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatEstimatedTime = (estimatedTime) => {
    if (!estimatedTime) return null;
    if (typeof estimatedTime === 'bigint') {
      const date = new Date(Number(estimatedTime) / 1000000);
      return date.toLocaleString();
    }
    return new Date(estimatedTime).toLocaleString();
  };

  const formatGasCost = (gasCost) => {
    if (!gasCost) return 'N/A';
    return `$${gasCost.toFixed(4)}`;
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getSwapTypeIcon = (swapType) => {
    return swapType === 'auto' ? <Shield className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />;
  };

  const getSwapTypeVariant = (swapType) => {
    return swapType === 'auto' ? 'default' : 'secondary';
  };

  // Filter swaps based on active filter
  const filteredSwaps = swapHistory.filter(swap => {
    if (activeFilter === 'all') return true;
    return swap.swapType === activeFilter;
  });

  const completedSwaps = filteredSwaps.filter(s => s.status.toLowerCase() === 'completed');
  const failedSwaps = filteredSwaps.filter(s => s.status.toLowerCase() === 'failed');
  const pendingSwaps = filteredSwaps.filter(s => ['pending', 'processing'].includes(s.status.toLowerCase()));
  const autoSwaps = swapHistory.filter(s => s.swapType === 'auto');
  const manualSwaps = swapHistory.filter(s => s.swapType === 'manual');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Swap History</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Loading swap history...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Swap History</h1>
          </div>
          <Badge variant="outline">
            {swapHistory.length} total swaps
          </Badge>
        </div>

        {/* Status Overview */}
        {swapHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-2xl font-bold">{completedSwaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-2xl font-bold">{failedSwaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-2xl font-bold">{pendingSwaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <div className="text-sm text-muted-foreground">Auto-Swaps</div>
                </div>
                <div className="text-2xl font-bold">{autoSwaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  <div className="text-sm text-muted-foreground">Manual Swaps</div>
                </div>
                <div className="text-2xl font-bold">{manualSwaps.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Failed Swaps Alert */}
        {failedSwaps.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{failedSwaps.length} swap(s) failed.</strong> Check the details below for error information and retry options.
            </AlertDescription>
          </Alert>
        )}

        {swapHistory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Swaps Yet</h3>
              <p className="text-muted-foreground mb-4">
                Your swaps will appear here once they're executed.
                Enable auto-hedging in settings or use manual swap to start trading.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Swap Activity</span>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter by type</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center space-x-2">
                    <History className="w-4 h-4" />
                    <span>All ({swapHistory.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="auto" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Auto ({autoSwaps.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center space-x-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Manual ({manualSwaps.length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeFilter} className="mt-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Swap</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Gas Cost</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSwaps.map((swap) => (
                          <TableRow key={swap.id?.toString() || Math.random()}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getSwapTypeIcon(swap.swapType)}
                                <Badge variant={getSwapTypeVariant(swap.swapType)}>
                                  {swap.swapType === 'auto' ? 'Auto' : 'Manual'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(swap.status)}
                                <Badge variant={getStatusVariant(swap.status)}>
                                  {swap.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTimestamp(swap.timestamp)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{swap.fromToken}</span>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{swap.toToken}</span>
                                {swap.intermediarySteps && swap.intermediarySteps.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-sm">
                                        <div className="font-medium mb-1">Intermediary Steps:</div>
                                        {swap.intermediarySteps.map((step, index) => (
                                          <div key={index}>{step}</div>
                                        ))}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>${formatAmount(swap.amount)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatPrice(swap.price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{formatGasCost(swap.gasCost)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="text-sm text-muted-foreground truncate" title={swap.reason}>
                                {swap.reason}
                              </div>
                              {swap.errorMessage && (
                                <div className="text-xs text-red-600 mt-1" title={swap.errorMessage}>
                                  Error: {swap.errorMessage}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {swap.retryCount && Number(swap.retryCount) > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="text-xs">
                                        {swap.retryCount.toString()} retries
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>This swap was retried {swap.retryCount.toString()} times</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {swap.estimatedCompletionTime && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Timer className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Estimated completion: {formatEstimatedTime(swap.estimatedCompletionTime)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button variant="ghost" size="sm">
                                      <Info className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm">
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Swap ID:</strong> {swap.id?.toString() || 'N/A'}</div>
                                      <div><strong>Type:</strong> {swap.swapType === 'auto' ? 'Auto-Hedge' : 'Manual Swap'}</div>
                                      <div><strong>Status:</strong> {swap.status}</div>
                                      <div><strong>Amount:</strong> ${formatAmount(swap.amount)}</div>
                                      <div><strong>Price:</strong> {formatPrice(swap.price)}</div>
                                      {swap.gasCost && <div><strong>Gas Cost:</strong> {formatGasCost(swap.gasCost)}</div>}
                                      {swap.retryCount && Number(swap.retryCount) > 0 && (
                                        <div><strong>Retries:</strong> {swap.retryCount.toString()}</div>
                                      )}
                                      {swap.intermediarySteps && swap.intermediarySteps.length > 0 && (
                                        <div>
                                          <strong>Route:</strong> {swap.fromToken} → {swap.intermediarySteps.join(' → ')} → {swap.toToken}
                                        </div>
                                      )}
                                      {swap.errorMessage && (
                                        <div className="text-red-600">
                                          <strong>Error:</strong> {swap.errorMessage}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Performance Analytics */}
        {swapHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="text-2xl font-bold">
                    {swapHistory.length > 0 
                      ? ((completedSwaps.length / swapHistory.length) * 100).toFixed(1)
                      : '0'
                    }%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {completedSwaps.length} of {swapHistory.length} swaps completed
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                  <div className="text-2xl font-bold">
                    ${swapHistory.reduce((sum, swap) => sum + swap.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Across all swap attempts
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Avg Gas Cost</div>
                  <div className="text-2xl font-bold">
                    ${swapHistory.filter(s => s.gasCost).length > 0
                      ? (swapHistory.reduce((sum, swap) => sum + (swap.gasCost || 0), 0) / swapHistory.filter(s => s.gasCost).length).toFixed(4)
                      : '0.0000'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Per successful transaction
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Auto vs Manual</div>
                  <div className="text-2xl font-bold">
                    {autoSwaps.length}:{manualSwaps.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Auto-hedge to manual ratio
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SwapHistory;
