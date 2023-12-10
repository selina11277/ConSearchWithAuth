import type { NextApiRequest, NextApiResponse } from 'next';
import type { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/clp_utils/makechain';
import { pinecone } from '@/clp_utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/clp_config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);
  console.log('history', history);
  // define source filter with source: "/Users/black/gpt/construction-search/docs/International Building Code - 2021pdf.pdf":
  // const sourceFilter = "/Users/black/gpt/construction-search/docs/Construction Definitions - 2014.pdf";
  // const sourceFilter = ["/Users/black/gpt/construction-search/docs/International Building Code - 2021pdf.pdf"];

  const fileNames: string[] = [
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
    "International_Residential_Code_2018.pdf",
    "National_Electrical_Code_2023.pdf",
];


  const basePath: string = "/Users/black/gpt/construction-search/docs/";

  const sourceFilter: string[] = fileNames.map(name => basePath + name);


  console.log('sourceFilter', sourceFilter);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    );

    let resolveWithDocuments : any;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    // Define the metadata filter
    const metadataFilter = {
        source: {
          $in: sourceFilter, // Filter documents by source
        },
    };

    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
      filter: metadataFilter,
      k: 9,
    });

    const chain = makeChain(retriever);

    const pastMessages = history
      .map((message: [string, string]) => {
        return [`Human: ${message[0]}`, `Assistant: ${message[1]}`].join('\n');
      })
      .join('\n');
    console.log(pastMessages);

    const response = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    const sourceDocuments = await documentPromise;

    console.log('response', response);
    res.status(200).json({ text: response, sourceDocuments });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
