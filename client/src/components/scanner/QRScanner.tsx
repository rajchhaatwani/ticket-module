import React, { useState } from 'react';
import { QrCode, CheckCircle, XCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react';

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    ticketInfo?: any;
  } | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate scanning process
    setTimeout(() => {
      // Mock successful scan
      setScanResult({
        type: 'success',
        message: 'Ticket validated successfully!',
        ticketInfo: {
          eventName: 'Tech Conference 2024',
          ticketType: 'VIP',
          userEmail: 'user@example.com',
          price: '$299.99'
        }
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      default: return QrCode;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600 mt-2">Scan tickets at event entry points</p>
      </div>

      {/* Scanner Interface */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Scanner Area */}
          <div className="relative aspect-square bg-gray-900 flex items-center justify-center">
            {isScanning ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-sm">Scanning QR Code...</p>
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Point camera at QR code</p>
              </div>
            )}
            
            {/* Scanning Frame */}
            <div className="absolute inset-4 border-2 border-blue-500 rounded-lg opacity-60">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6">
            {!scanResult ? (
              <div className="space-y-4">
                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {isScanning ? 'Scanning...' : 'Start Scanning'}
                </button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Allow camera access to scan QR codes
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Scan Result */}
                <div className={`p-4 rounded-lg border ${getResultColor(scanResult.type)}`}>
                  <div className="flex items-start">
                    {React.createElement(getResultIcon(scanResult.type), {
                      className: `h-6 w-6 mr-3 mt-0.5 ${scanResult.type === 'success' ? 'text-green-600' : 
                                 scanResult.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`
                    })}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{scanResult.message}</h4>
                      {scanResult.ticketInfo && (
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Event:</span> {scanResult.ticketInfo.eventName}</p>
                          <p><span className="font-medium">Ticket:</span> {scanResult.ticketInfo.ticketType}</p>
                          <p><span className="font-medium">Email:</span> {scanResult.ticketInfo.userEmail}</p>
                          <p><span className="font-medium">Price:</span> {scanResult.ticketInfo.price}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Scan Another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-md mx-auto bg-blue-50 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How to use the scanner:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Click "Start Scanning\" to activate the camera
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Point the camera at the QR code on the ticket
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Wait for the automatic scan and validation
          </li>
          <li className="flex items-start">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Allow or deny entry based on the result
          </li>
        </ul>
      </div>

      {/* Recent Scans */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Scans</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Mock recent scans */}
              {[
                { time: '2 minutes ago', result: 'success', email: 'user1@example.com', event: 'Tech Conference 2024' },
                { time: '5 minutes ago', result: 'error', email: 'user2@example.com', event: 'Tech Conference 2024' },
                { time: '8 minutes ago', result: 'success', email: 'user3@example.com', event: 'Tech Conference 2024' },
              ].map((scan, index) => {
                const Icon = scan.result === 'success' ? CheckCircle : XCircle;
                const colorClass = scan.result === 'success' ? 'text-green-600' : 'text-red-600';
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${colorClass}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{scan.email}</p>
                        <p className="text-xs text-gray-500">{scan.event}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium capitalize ${colorClass}`}>
                        {scan.result === 'success' ? 'Valid' : 'Invalid'}
                      </p>
                      <p className="text-xs text-gray-500">{scan.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;