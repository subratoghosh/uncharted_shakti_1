import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DEFAULT_FAQS = [
  {
    question: 'How does shaktIQ detect OpenAPI breaking changes?',
    answer:
      'shaktIQ parses both base and candidate OpenAPI specifications into deep Abstract Syntax Trees (AST). It performs deterministic rule validation across all endpoints, methods, parameters, request bodies, and response codes. Changes such as removing an endpoint, changing parameter types, adding required request fields, or altering status codes are flagged with high-precision severity classification (BREAKING, WARNING, INFO).',
    category: 'General',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'Which OpenAPI and API schema versions are supported?',
    answer:
      'shaktIQ supports OpenAPI 3.0.x and OpenAPI 3.1.x, as well as Swagger 2.0 specifications in both YAML and JSON formats. It handles complex JSON Schema references ($ref), polymorphs (oneOf, anyOf, allOf), and custom vendor extensions.',
    category: 'Compatibility',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How does the Blast Radius impact calculation work?',
    answer:
      'When an API schema changes, shaktIQ evaluates downstream dependencies registered to that endpoint. It computes an impact score based on consumer service tier (Core, Internal, Public SDK), active traffic volume, and the nature of the breaking change. If critical consumers are impacted, the release verdict is automatically shifted to BLOCKED.',
    category: 'Security & Risk',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How does AI remediation generate backward-compatible fixes?',
    answer:
      'When breaking changes are detected, shaktIQ feeds the schema AST diff and consumer contract constraints to our remediation engine. It synthesizes a production-grade Release Dossier containing: (1) an executive risk analysis, (2) concrete backward-compatible schema patches, (3) route deprecation strategies, and (4) copy-paste ready migration code.',
    category: 'Remediation',
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'Can I test shaktIQ without configuring any external API keys?',
    answer:
      'Yes! shaktIQ includes built-in mock and sandbox fallback modes. You can compare specs immediately in the interactive console, inspect live AST diffs, and explore sample projects without requiring any external keys.',
    category: 'General',
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How do GitHub Webhooks work for universal developer workflows?',
    answer:
      'You can register a webhook in any GitHub repository or install the shaktIQ GitHub integration. Whenever any developer pushes a commit or opens a pull request that touches an OpenAPI specification, GitHub dispatches an event to shaktIQ. shaktIQ automatically runs the diff, computes the release verdict, and updates status checks.',
    category: 'Integrations',
    order: 6,
    createdAt: new Date().toISOString(),
  },
];

// GET: List all active FAQs (public)
export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection('faqs');

    let faqs = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();

    // If database has no FAQs yet, seed with defaults
    if (faqs.length === 0) {
      try {
        await collection.insertMany(DEFAULT_FAQS);
        faqs = await collection.find({}).sort({ order: 1, createdAt: 1 }).toArray();
      } catch {
        return NextResponse.json({ data: DEFAULT_FAQS });
      }
    }

    const formatted = faqs.map((f) => ({
      _id: f._id.toString(),
      id: f._id.toString(),
      question: f.question,
      answer: f.answer,
      category: f.category || 'General',
      order: f.order ?? 10,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ data: DEFAULT_FAQS });
  }
}

// POST: Create a new FAQ (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: { message: 'Unauthorized. Admin privilege required.' } }, { status: 403 });
    }

    const body = await req.json();
    const { question, answer, category = 'General', order = 10 } = body;

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: { message: 'Question and answer are required.' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('faqs');

    const newFaq = {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
      order: Number(order) || 10,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newFaq);

    return NextResponse.json({
      data: {
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        ...newFaq,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: { message: 'Failed to create FAQ in database.' } }, { status: 500 });
  }
}
