import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

const DEFAULT_FAQS = [
  {
    question: 'How does shaktIQ detect breaking software changes?',
    answer:
      'shaktIQ parses both base and candidate service specifications into deep semantic structures. It performs deterministic rule validation across all endpoints, methods, parameters, request bodies, and response codes. Changes such as removing an endpoint, changing parameter types, adding required request fields, or altering status codes are flagged with high-precision severity classification (BREAKING, WARNING, INFO).',
    category: 'General',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'Which service interface and contract formats are supported?',
    answer:
      'shaktIQ supports modern service contract specifications in both YAML and JSON formats. It handles complex data schema references ($ref), polymorphs (oneOf, anyOf, allOf), and custom extensions, as well as route controller files.',
    category: 'Compatibility',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How does the Downstream Client Impact calculation work?',
    answer:
      'When a service interface or route changes, shaktIQ evaluates downstream dependencies registered to that service. It computes an impact score based on consumer service tier (Core, Internal, Public Clients), active traffic volume, and the nature of the breaking change. If critical consumers are impacted, the release verdict is automatically shifted to BLOCKED.',
    category: 'Security & Risk',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How does automated remediation generate backward-compatible fixes?',
    answer:
      'When breaking changes are detected, shaktIQ feeds the structural diff and consumer contract constraints to our automated intelligence remediation engine. It synthesizes a production-grade Release Dossier containing: (1) an executive risk analysis, (2) concrete backward-compatible schema patches, (3) route deprecation strategies, and (4) copy-paste ready migration code.',
    category: 'Remediation',
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'Can I test shaktIQ without configuring any external setup?',
    answer:
      'Yes! shaktIQ includes built-in mock and sandbox fallback modes. You can compare specs immediately in the interactive console, inspect live structural diffs, and explore sample projects right out of the box.',
    category: 'General',
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    question: 'How do Git and pull request safeguards work in developer workflows?',
    answer:
      'You can register a webhook in any repository or connect your version control provider. Whenever any developer pushes a commit or opens a pull request that touches interface contracts or controllers, an event is sent to shaktIQ. shaktIQ automatically runs the diff, computes the release verdict, and updates status checks.',
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

    return NextResponse.json(
      { data: formatted },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { data: DEFAULT_FAQS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
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
