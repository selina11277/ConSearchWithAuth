import Image from "next/image";
import BluePrintBig from '@/public/blueprint2.png';
import { useRouter } from "next/router"; // Corrected import
import config from "@/config";
import ButtonGet from "@/components/ButtonGet"

const CTA = () => {
  const router = useRouter();

  const HandleClick = (e) =>  {
    e.preventDefault(); // Prevent the default action
    router.push(config.callbackUrl);
  }

  return (
    <section className="relative hero overflow-hidden min-h-screen">
      <Image
        src={BluePrintBig}
        alt="Background"
        className="object-cover w-full"
        fill
      />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Code Questions Answered - Now.
          </h2>
          <p className="text-lg opacity-80 mb-12 md:mb-16">
            Save time and stress with your projects - Get CodeLogic Pro today.
          </p>

          <ButtonGet/>
        </div>
      </div>
    </section>
  );
};

export default CTA;
