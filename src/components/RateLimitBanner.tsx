// import { useEffect, useState } from "react";
// import { AlertTriangle, Clock, X } from "lucide-react";
// import { RateLimitInfo } from "@/lib/leetcode-api";
//
// interface RateLimitBannerProps {
//   rateLimit: RateLimitInfo;
//   onDismiss: () => void;
// }
//
// export function RateLimitBanner({ rateLimit, onDismiss }: RateLimitBannerProps) {
//   const [timeLeft, setTimeLeft] = useState(rateLimit.reset);
//
//   useEffect(() => {
//     if (timeLeft <= 0) {
//       onDismiss(); // Auto-dismiss when timer reaches 0
//       return;
//     }
//
//     const interval = setInterval(() => {
//       setTimeLeft(prev => {
//         const newTime = Math.max(0, prev - 1);
//         if (newTime === 0) {
//           setTimeout(onDismiss, 1000); // Dismiss after showing 0 for 1 second
//         }
//         return newTime;
//       });
//     }, 1000);
//
//     return () => clearInterval(interval);
//   }, [timeLeft, onDismiss]);
//
//   const formatTime = (seconds: number): string => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     }
//     if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };
//
//   const percentage = (timeLeft / rateLimit.reset) * 100;
//
//   return (
//     <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
//       <div className="flex items-start justify-between gap-3">
//         <div className="flex items-start gap-3 flex-1">
//           <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
//           <div className="flex-1 space-y-2">
//             <div>
//               <h3 className="font-semibold text-foreground">Rate Limit Exceeded</h3>
//               <p className="text-sm text-muted-foreground">
//                 {rateLimit.remaining} of {rateLimit.limit} requests remaining
//               </p>
//             </div>
//
//             <div className="space-y-1.5">
//               <div className="flex items-center gap-2 text-sm">
//                 <Clock className="h-4 w-4 text-yellow-500" />
//                 <span className="font-mono font-bold text-yellow-500">
//                   {timeLeft > 0 ? formatTime(timeLeft) : "Ready!"}
//                 </span>
//                 <span className="text-muted-foreground">until reset</span>
//               </div>
//
//               <div className="h-2 rounded-full bg-secondary overflow-hidden">
//                 <div
//                   className="h-full bg-yellow-500 transition-all duration-1000 ease-linear"
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//
//         <button
//           onClick={onDismiss}
//           className="rounded-md p-1 hover:bg-secondary transition-colors"
//         >
//           <X className="h-4 w-4 text-muted-foreground" />
//         </button>
//       </div>
//     </div>
//   );
// }
