import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana,inter } from '@/app/ui/fonts/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${inter.className} flex flex-row items-center leading-none text-blue`}
    >
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" style={{color: '#000080'}} />
      <p className="text-[44px]" style={{color: '#000080'}}>RECIPE</p>
      <p className={`text-[44px] ${lusitana.className}`} style={{color: '#006400'}}>BOT</p>
    </div>
    
  );
}