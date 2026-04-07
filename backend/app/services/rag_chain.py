from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama

from app.rag.retriever import get_retriever
from app.config.settings import LLM_MODEL, OLLAMA_BASE_URL

def get_rag_chain(mode="teach", system_prompt=None):
    """
    Creates a dynamic RAG chain with multiple study modes or custom system prompt.
    Modes: 'teach', 'visualize', 'duck', 'notes'
    """
    
    # 1. Initialize Retriever and LLM
    retriever = get_retriever()
    
    llm = ChatOllama(
        model=LLM_MODEL,
        temperature=0.3, 
        base_url=OLLAMA_BASE_URL
    )

    # 2. The Prompt Factory
    if system_prompt:
        selected_system_prompt = system_prompt
    else:
        prompts = {
            "teach": """You are a Master Study Assistant specializing in First Principles Thinking.
Break concepts down to fundamental truths. 
- Prefix with **[FROM DOCUMENT]** for text-based facts.
- Prefix with **[EXTERNAL KNOWLEDGE]** for mental models/outside info.
- Structure: Core Concept -> Deep Dive -> Document Example -> Real-world Example -> Summary.""",

            "visualize": """Create a Mermaid.js diagram showing the key concepts and their relationships.

Output the diagram code in this exact format:
graph TD
    A["First Concept"]
    B["Second Concept"]
    C["Third Concept"]
    A --> B
    B --> C

Rules:
- Start with: graph TD
- Use node IDs: A, B, C, D, E, F, G, H (max 8-10 nodes)
- Format: NodeID["Display Text"]
- Connect concepts with --> arrows
- Keep text descriptions SHORT (under 30 chars)
- No code blocks, no markdown formatting
- Output ONLY the diagram - no explanation before or after""",

            "duck": """You are a Socratic Tutor using the 'Protégé Effect'. Your role:
1. Identify ONE key concept from the document.
2. Ask the user to explain it to YOU in their own words.
3. Challenge vague answers and encourage deeper thinking.
- Be curious and probing, not lecturing.""",

            "notes": """You are an Academic Researcher. Synthesize the <DOCUMENT_CONTEXT> into high-density Study Notes.

### GOAL:
Transform raw document chunks into a structured, printable study guide.

### REQUIRED STRUCTURE:
1. **The Big Picture**: 3-sentence executive summary.
2. **Taxonomy of Concepts**: Categorized list of key terms + 'First Principle' logic for each.
3. **Relational Logic**: How these concepts connect.
4. **Self-Assessment**: 3 active-recall questions + 1 'What-if' logic scenario.

### STYLING:
- Use Markdown headers (##, ###).
- Use Bold for key terms.
- If code/SQL is present, provide one 'Golden Standard' snippet."""
        }
        selected_system_prompt = prompts.get(mode, prompts["teach"])

    # 3. Create the Template
    prompt = PromptTemplate.from_template(
        f"""{selected_system_prompt}

<DOCUMENT_CONTEXT>
{{context}}
</DOCUMENT_CONTEXT>

<STUDENT_QUESTION>
{{question}}
</STUDENT_QUESTION>

Deep Dive Analysis:"""
    )

    # 4. Helper function to format retrieved documents
    def format_docs(docs):
        if not docs:
            return "No relevant information found in the document."
        return "\n\n".join(doc.page_content for doc in docs)

    # 5. Build the LCEL Chain
    chain = (
        {
            "context": lambda x: format_docs(retriever.invoke(x["question"])),
            "question": lambda x: x["question"],
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain