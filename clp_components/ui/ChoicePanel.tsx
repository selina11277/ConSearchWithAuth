import { useState } from "react";
import { useRouter } from "next/router"; 
import { signOut } from "next-auth/react";
import apiClient from "@/libs/api";
import { usePrivate } from "@/hooks/usePrivate";
import TagSEO from "@/components/TagSEO";
import ButtonCheckout from "@/components/ButtonCheckout";
import { getServerSession } from "next-auth/next";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import config from "@/config";
import CodeChoice from '@/clp_components/ui/CodeChoice';




export default function ChoicePanel() {

  const codeChoices = [
    { bgColorClass: 'bg-slate-300', codeName: 'ADA ' },
    { bgColorClass: 'bg-slate-300', codeName: 'IBC' },
    { bgColorClass: 'bg-slate-300', codeName: 'IFC' },
    { bgColorClass: 'bg-slate-200', codeName: 'IFGC' },
    { bgColorClass: 'bg-slate-300', codeName: 'IMC' },
    { bgColorClass: 'bg-slate-200', codeName: 'IPC' },
    { bgColorClass: 'bg-slate-200', codeName: 'ISPSC' },
    { bgColorClass: 'bg-slate-300', codeName: 'IECC' },
    // { bgColorClass: 'bg-blue-200', codeName: 'IBC' },
    // { bgColorClass: 'bg-red-300', codeName: 'IRC' },
    // { bgColorClass: 'bg-green-200', codeName: 'ADA' },
  ];



  const handleSelectionChange = (codeName: string, isSelected: boolean) => {
    console.log(codeName, isSelected); // Here, you can manage the state or perform actions based on the selection.
  };
  // Custom hook to make private pages easier to deal with (see /hooks folder)
  
  return (
    <div className={`border-solid border-black border-2 rounded-xl flex self-center flex-col md-p-5`}>
        <h2 className='text-center text-2xl font-mono p-4'>Select Codes to Query:</h2>
      <div className='w-full flex justify-left h-full flex-wrap overflow-y-scroll'>
        {codeChoices.map((choice, index) => (
          <CodeChoice key={index} bgColorClass={choice.bgColorClass} codeName={choice.codeName} onSelectionChange={handleSelectionChange} />
        ))}
      </div>
  </div>
  );
}

