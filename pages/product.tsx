import { useRef, useState, useEffect } from 'react';
import Layout from '@/clp_components/layout';
import styles from '@/clp_styles/Home.module.css';
import { Message } from '@/clp_types/chat';

import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/clp_components/ui/LoadingDots';
import ChoicePanel from '@/clp_components/ui/ChoicePanel';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/clp_components/ui/accordion';
import { useRouter } from 'next/router';
import { usePrivate } from "@/hooks/usePrivate";

const documents: string[] = [
  "ADA_Standards_2010.pdf",
  "ADA_Standards_Guidance_2010.pdf",
  "Construction_Definitions_2014.pdf",
  "International_Building_Code_2021.pdf",
  "International_Fire_Code_2021.pdf",
  "International_Fuel_Gas_Code_2021.pdf",
  "International_Mechanical_Code_2021.pdf",
  "International_Plumbing_Code_2021.pdf",
  "International_Swimming_Pool_and_Spa_Code_2021.pdf",
  "International_Energy_Conservation_Code_2021.pdf",
];

function processChatMessage(text: string): string {
  // Remove 'markdown' if it's within the first 20 characters
  if (text.substring(0, 20).includes('markdown')) {
    text = text.replace('markdown', '');
  }

  // Remove all sets of three consecutive backticks
  text = text.replace(/```/g, '');

  // Escape all individual backticks
  text = text.replace(/`/g, '\\`');

  return text;
}


export default function Home() {
  const router = useRouter();
  const [session, status] = usePrivate();
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Welcome to CodeLogic Pro. How can we assist you today?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/'); // Redirect to the home page if unauthenticated
    } else if (status === 'authenticated') {
      checkUserAccess();
    }
  }, [status, router]);

  const checkUserAccess = async (): Promise<void> => {
    try {
      const response = await fetch('/api/user/hasAccess');
      if (response.ok) {
        const data = await response.json() as { hasAccess: boolean };
        if (!data.hasAccess) {
          router.push('/');
        } else {
          setHasAccess(true);
        }
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      router.push('/');
    }
  };

  
  // State to track which accordion is visible
  const [visibleAccordionIndex, setVisibleAccordionIndex] = useState<null | number>(null);

  // Function to toggle accordion visibility
  const toggleAccordion = (index: number) => {
    if (visibleAccordionIndex === index) {
      // Hide the currently visible accordion
      setVisibleAccordionIndex(null);
    } else {
      // Show the accordion at the current index
      setVisibleAccordionIndex(index);
    }
  };

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => {
  //   textAreaRef.current?.focus();
  // }, []);

  // State to manage selected documents
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // Handle document selection
  const handleDocSelection = (doc, isSelected) => {
    setSelectedDocs(prevSelectedDocs => {
      if (isSelected) {
        return prevSelectedDocs.includes(doc) ? prevSelectedDocs : [...prevSelectedDocs, doc];
      } else {
        return prevSelectedDocs.filter(selectedDoc => selectedDoc !== doc);
      }
    });
  };

  useEffect(() => {
    if (selectedDocs.length > 0) {
      setError(null);
    }
  }, [selectedDocs]);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (selectedDocs.length === 0) {
      setError("No codes are selected, please select at least one code to query.");
      return;
    }

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      // messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };



  // Explicitly type the accumulator in the reduce function
  const allSourceDocs = messages.reduce<Document[]>((acc, message) => {
    if (message.sourceDocs) {
      return acc.concat(message.sourceDocs);
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4">
        <br />
        <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
          CodeLogic Pro
        </h1>
        <div className='flex md:flex-nowrap flex-wrap border-solid border-black w-full self-center justify-around md:px-5'>
        <ChoicePanel onDocSelectionChange={handleDocSelection} />
          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                    let icon;
                    let className;
                    if (message.type === 'apiMessage') {
                      icon = (
                        <Image
                          key={index}
                          src="/logo.png"
                          alt="AI"
                          width="40"
                          height="40"
                          className={styles.boticon}
                          priority
                        />
                      );
                      className = styles.apimessage;
                    } else {
                      icon = (
                        <div
                          style={{
                            width: '1.6em',
                            height: '1.6em',
                            backgroundColor: 'black',
                            borderRadius: '50%',
                            marginRight: '1.55em',
                            marginLeft: '0.4em',
                          }}
                        />
                      );
                      className =
                        loading && index === messages.length - 1
                          ? styles.usermessagewaiting
                          : styles.usermessage;
                    }
                    return (
                      <>
                        <div key={`chatMessage-${index}`} className={className}>
                          {icon}
                          <div className={styles.markdownanswer}>
                            <ReactMarkdown linkTarget="_blank">
                              {processChatMessage(message.message)}
                            </ReactMarkdown>
                          </div>
                        </div>
                        {message.sourceDocs && (
                          <>
                          <div className={className + ' flex justify-center'}>
                            <button
                              onClick={() => toggleAccordion(index)}
                              className="my-2 p-2 text-blue-500 border border-blue-500 rounded justify-center"
                            >
                              {visibleAccordionIndex === index ? "Hide Sources" : "See Sources"}
                            </button>
                          </div>
                            
                            {visibleAccordionIndex === index && (
                              <div className="p-5">
                                <Accordion
                                  type="single"
                                  collapsible
                                  className="flex-col"
                                >
                                  {message.sourceDocs.map((doc, docIndex) => (
                                    <div key={`messageSourceDocs-${docIndex}`}>
                                      <AccordionItem value={`item-${docIndex}`}>
                                        <AccordionTrigger>
                                          <h3>Source {docIndex + 1}</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <ReactMarkdown linkTarget="_blank">
                                            {doc.pageContent}
                                          </ReactMarkdown>
                                          <p className="mt-2">
                                          <b>Source:</b> {doc.metadata.source.split('/').pop().replace(/_/g, ' ').replace('.pdf', '')}
                                          </p>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </div>
                                  ))}
                                </Accordion>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    );
                  })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'What fasteners are sufficient at shear walls?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>

        </div>
        
      </div>
      <footer className="m-auto p-4">
        <h1 className='text-2xl text-center'>
          Demo by Tribble Labs.
        </h1>
        <br />
          <h1 className=' text-center text-lg'>
            This is a pilot. Like what you see? 
          </h1>
          <h1 className=' text-center text-lg'>
            Send us an email at contact@codelogicpro.com to be notified about updates and launch.
          </h1>
      </footer>
    </Layout>
  );
  
}
