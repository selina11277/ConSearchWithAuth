import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import type { Document } from 'langchain/document';
import type { VectorStoreRetriever } from 'langchain/vectorstores/base';



const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an expert building code and standards inspector in the United States. Use the following pieces of context to answer the question at the end with exceptional attention to detail and looking at all text sections below without exception.
Do it with great skill and great effort without exception. If the question is about building codes and standards, you have all of the information that you need in the context to answer the question. 
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context or chat history, politely respond that you are tuned to only answer questions that are related to building codes and standards.

You should answer the question with formatting, bold font, and bulletpoints as appropriate. The user likes bullet points. Please provide context to your answer, and give the user a complete and thorough answer. For example, if the user asks about ramp height, you are welcome to include
something about hand rails. 

Each time you quote a section or text from the context, please include the source of the text in brackets so people know which code or document you are quoting from.
Notice there may be more than one source.
Don't talk about "the provided context". The user need not know about the inner workings of this system. Just answer the question if the information is available.

<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
Helpful answer in markdown:`;

// const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
//   const serializedDocs = docs.map((doc) => doc.pageContent);
//   return serializedDocs.join(separator);
// };

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => {
    // Include the source information and the page content
    return `\n\n**Source:** ${doc.metadata.source.split('/').pop().replace(/_/g, ' ').replace('.pdf', '')}\n${doc.pageContent}\n\n`;
  });
  return serializedDocs.join(separator);
};


export const makeChain = (retriever: VectorStoreRetriever) => {
  const condenseQuestionPrompt =
    ChatPromptTemplate.fromTemplate(CONDENSE_TEMPLATE);
  const answerPrompt = ChatPromptTemplate.fromTemplate(QA_TEMPLATE);

  const model = new ChatOpenAI({
    temperature: 0.1, 
    modelName: 'gpt-4-1106-preview', 
  });

  // Rephrase the initial question into a dereferenced standalone question based on
  // the chat history to allow effective vectorstore querying.
  const standaloneQuestionChain = RunnableSequence.from([
    condenseQuestionPrompt,
    model,
    new StringOutputParser(),
  ]);

  // Retrieve documents based on a query, then format them.
  const retrievalChain = retriever.pipe(combineDocumentsFn);

  // Generate an answer to the standalone question based on the chat history
  // and retrieved documents. Additionally, we return the source documents directly.
  const answerChain = RunnableSequence.from([
    {
      context: RunnableSequence.from([
        (input) => input.question,
        retrievalChain,
      ]),
      chat_history: (input) => input.chat_history,
      question: (input) => input.question,
    },
    answerPrompt,
    model,
    new StringOutputParser(),
  ]);

  // First generate a standalone question, then answer it based on
  // chat history and retrieved context documents.
  const conversationalRetrievalQAChain = RunnableSequence.from([
    {
      question: standaloneQuestionChain,
      chat_history: (input) => input.chat_history,
    },
    answerChain,
  ]);

  return conversationalRetrievalQAChain;
};
