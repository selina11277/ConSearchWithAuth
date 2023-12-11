import { useRouter } from "next/router"; // Corrected import
import config from "@/config";

const CTA = () => {
  const router = useRouter();

  const HandleClick = (e) =>  {
    e.preventDefault(); // Prevent the default action
    router.push(config.callbackUrl);
  }

  return (

    <button className="btn btn-primary btn-wide"
    onClick={HandleClick}
    >Get CodeLogic Pro</button>
  );
};

export default CTA;
