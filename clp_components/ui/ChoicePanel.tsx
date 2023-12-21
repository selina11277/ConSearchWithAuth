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




export default function ChoicePanel({ onDocSelectionChange }) {




  const codeChoices = [
    { codeName: 'ADA', isSelectedByDefault: true},
    { codeName: 'IBC', isSelectedByDefault: true },
    { codeName: 'IFC', isSelectedByDefault: false },
    { codeName: 'IFGC', isSelectedByDefault: false },
    { codeName: 'IMC', isSelectedByDefault: false },
    { codeName: 'IPC', isSelectedByDefault: false },
    { codeName: 'ISPSC', isSelectedByDefault: false },
    { codeName: 'IECC', isSelectedByDefault: false },
    { codeName: 'IFGC', isSelectedByDefault: false },
  ];

  const defaultJurisdiction = 'US - General'; // Set your default jurisdiction
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(defaultJurisdiction);

  // ... other states and functions

  const jurisdictions = ['US - General']; // Add your jurisdictions here

  const handleJurisdictionChange = (e) => {
    setSelectedJurisdiction(e.target.value);
  };



  const handleSelectionChange = (codeName, isSelected) => {
    onDocSelectionChange(codeName, isSelected);
  };
  // Custom hook to make private pages easier to deal with (see /hooks folder)
  
  return (
    <div className={`border-solid border-black border rounded-xl flex self-baseline mt-4 flex-col md:p-5 max-w-[290px]`}>
      
      
      <h2 className='text-center text-md font-mono p-4 pt-0'>Select Codes to Query:</h2>
      <div className='w-full flex justify-left h-full flex-wrap overflow-y-auto max-h-[35vh]'>
        {codeChoices.map((choice, index) => (
          <CodeChoice 
            key={index} 
            codeName={choice.codeName}
            isSelectedByDefault={choice.isSelectedByDefault}
            onSelectionChange={(isSelected) => onDocSelectionChange(choice.codeName, isSelected)}
          />
        ))}
      </div>
      <hr className="my-4 border-black" />
      <h2 className='text-center text-md font-mono p-4'>Select Jurisdiction:</h2>
      <select 
        className='md:w-full w-5/6 md:m-0 m-4 p-2 rounded-md border border-amber-300' 
        value={selectedJurisdiction} 
        onChange={handleJurisdictionChange}
      >
        {jurisdictions.map((jurisdiction, index) => (
          <option key={index} value={jurisdiction}>{jurisdiction}</option>
        ))}
      </select>
  </div>
  );
}

