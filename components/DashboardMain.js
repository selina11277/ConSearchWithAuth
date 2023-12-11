import { useState } from "react";
import { useRouter } from "next/router"; 
import { signOut } from "next-auth/react";
import apiClient from "@/libs/api";
import { usePrivate } from "@/hooks/usePrivate";
import TagSEO from "@/components/TagSEO";
import ButtonGet from "@/components/ButtonGet";
import { getServerSession } from "next-auth/next";
import { useEffect } from "react";
import { useSession } from "next-auth/react";



export default function DashboardMain() {
  // Custom hook to make private pages easier to deal with (see /hooks folder)
  const [isEditing, setIsEditing] = useState(false);
  const [session, status, updateSession] = usePrivate({}); // Add updateSession function
  const router = useRouter();


  const email =session?.user?.email;

  const [hasAccess, setHasAccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(" ")[0] || "",
    lastName: session?.user?.name?.split(" ")[1] || "",
    email: session?.user?.email || "",
    password: "********",
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/user/hasAccess')
        .then(res => res.json())
        .then(data => {
          if (data.hasAccess !== undefined) {
            setHasAccess(data.hasAccess);
          }
        })
        .catch(error => console.error('Error fetching access status:', error));
    }
  }, [status]);



  const handleClick = (e) => {
    router.push('/#pricing');
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/user/update", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      console.log("Update response:", response);
      // Handle successful update

      // Update session.user with new data
      updateSession((session) => ({
        ...session,
        user: {
          ...session.user,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        },
      }));
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle error
    }
    setIsEditing(false);
    setIsLoading(false);
  };

  // Show a loader when the session is loading.
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-md mx-auto space-y-8 bg-white p-4 rounded-lg shadow-md"> {/* Adjusted width */}
          <h1 className="text-3xl md:text-4xl font-extrabold">My Account:</h1>

          <form>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                name="firstName"
                className="input input-bordered"
                value={formData.firstName}
                onChange={handleChange}
                disabled='true'
              />
            </div> */}



            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered"
                value={email}
                onChange={handleChange}
                disabled='true'
              />
            </div>


            {/* Styled Access Status Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Access Status</span>
              </label>
              <div className={`input input-bordered text-center justify-center flex-col flex ${hasAccess ? "bg-green-100" : "bg-red-100"}`}>
                {hasAccess ? "Subscription Active" : "No Active Subscription"}
              </div>
            </div>
          </form>

        

          <button
            className="btn m-2 bg-red-300"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Logout
          </button>

          <button className="btn btn-primary btn-wide"
          onClick={handleClick}
          >Get CodeLogic Pro</button>


        </section>
      </main>
    </section>
  );
}




// import { useState } from "react";
// import { signOut } from "next-auth/react";
// import apiClient from "@/libs/api";
// import { usePrivate } from "@/hooks/usePrivate";
// import TagSEO from "@/components/TagSEO";
// import ButtonCheckout from "@/components/ButtonCheckout"
// import { getServerSession } from "next-auth/next";

// export default function DashboardMain() {
//   // Custom hook to make private pages easier to deal with (see /hooks folder)
//   const [isEditing, setIsEditing] = useState(false);
//   const [session, status] = usePrivate({});

//   const hasAccess = session?.user?.hasAccess;

//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: session?.user?.name?.split(" ")[0] || '', // Assuming the first name is the first part of the full name
//     lastName: session?.user?.name?.split(" ")[1] || '', // Assuming the last name is the second part of the full name
//     email: session?.user?.email || '',
//     password: '********', // Placeholder for password
//   });


//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//   };

//   const handleSave = async () => {
//     setIsLoading(true);
//     try {
//       const response = await apiClient.post('/user/update', {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//       });
//       console.log('Update response:', response);
//       // Handle successful update

//       // Re-fetch the session to update user data
//       const newSession = await getServerSession({ req });
//       if (newSession) {
//         session.user = newSession.user;
//       }
//     } catch (error) {
//       console.error('Error updating user:', error);
//       // Handle error
//     }
//     setIsEditing(false);
//     setIsLoading(false);
//   };

//   // Show a loader when the session is loading.
//   if (status === "loading") {
//     return <p>Loading...</p>;
//   }

//   return (
//     <section>
//       <main className="min-h-screen p-8 pb-24">
//         <section className="max-w-md mx-auto space-y-8 bg-white p-4 rounded-lg shadow-md"> {/* Adjusted width */}
//           <h1 className="text-3xl md:text-4xl font-extrabold">My Account:</h1>

//           <form>
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">First Name</span>
//               </label>
//               <input
//                 type="text"
//                 name="firstName"
//                 className="input input-bordered"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 disabled={!isEditing} 
//               />
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Last Name</span>
//               </label>
//               <input
//                 type="text"
//                 name="lastName"
//                 className="input input-bordered"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 disabled={!isEditing} 
//               />
//             </div>

//             {/* Styled Access Status Field */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Access Status</span>
//               </label>
//               <div className={`input input-bordered text-center justify-center flex-col flex ${hasAccess ? "bg-green-100" : "bg-red-100"}`}>
//                 {hasAccess ? "Subscription Active" : "No Active Subscription"}
//               </div>
//             </div>

//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text">Email</span>
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 className="input input-bordered"
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled='true'
//               />
//             </div>
//           </form>

          

//           <button
//             className="btn m-2 btn-primary"
//             onClick={isEditing ? handleSave : handleEditToggle}
//           >
//             {isEditing ? 'Save' : 'Edit'}
//           </button>

//           <button
//             className="btn m-2 bg-red-300"
//             onClick={() => signOut({ callbackUrl: '/' })}
//           >
//             Logout
//           </button>

//           <ButtonCheckout/>


//         </section>
//       </main>
//     </section>
//   );
// }