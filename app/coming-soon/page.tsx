import { ComingSoonClient } from './ComingSoonClient';

export const dynamic = 'force-dynamic';

export default function ComingSoonPage() {
  const until = process.env.MAINTENANCE_UNTIL || null;
  return <ComingSoonClient until={until} />;
}
