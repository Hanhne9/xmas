
import React from 'react';
import { AppStatus } from '../types';

interface UIProps {
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
  expansion: number;
  handDetected: boolean;
}

const UI: React.FC<UIProps> = ({ status, setStatus, expansion, handDetected }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-12 z-10 text-white">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase font-mono">
            Xmas Spirit <span className="text-red-500">.</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            3D Particle Morphing System
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-2 px-4 rounded-md">
           <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
           <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
             {handDetected ? 'Hand Tracked' : 'No Signal'}
           </span>
        </div>
      </div>

      {/* Main interaction logic */}
      <div className="flex flex-col items-center gap-8">
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center gap-6 pointer-events-auto">
             <div className="text-center max-w-md">
                <h2 className="text-xl font-light text-zinc-200 mb-2 italic">Chạm vào tinh thần Giáng Sinh qua cử chỉ bàn tay.</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Cho phép camera để hệ thống nhận diện chuyển động căng và khép của hai bàn tay để điều khiển sự giãn nở của cây thông.
                </p>
             </div>
             <button 
                onClick={() => setStatus(AppStatus.ACTIVE)}
                className="group relative overflow-hidden bg-white text-black px-12 py-4 text-sm font-bold uppercase tracking-widest transition-all hover:bg-zinc-200"
              >
                Kích hoạt Camera
             </button>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin" />
             <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Đang khởi tạo AI...</span>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="text-center bg-red-950/20 border border-red-500/50 p-6 max-w-sm pointer-events-auto">
             <p className="text-red-400 text-sm mb-4">Không thể khởi động camera hoặc module AI.</p>
             <button 
               onClick={() => window.location.reload()}
               className="text-[10px] font-bold uppercase tracking-widest underline"
             >
               Thử lại
             </button>
          </div>
        )}
      </div>

      {/* Instructions & Status */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-6 max-w-xs">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Hướng dẫn</span>
            <ul className="text-[11px] text-zinc-400 font-mono space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-700" />
                Dùng hai tay hướng về camera
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-700" />
                Căng tay để bùng nổ hạt
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-700" />
                Khép tay để tạo cây thông
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 font-mono">
           <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-600 uppercase">Trạng thái hạt:</span>
              <span className="text-sm font-bold w-12 text-right">
                {Math.round(expansion * 100)}%
              </span>
           </div>
           <div className="w-64 h-[1px] bg-zinc-900 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out" 
                style={{ width: `${expansion * 100}%` }}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default UI;
