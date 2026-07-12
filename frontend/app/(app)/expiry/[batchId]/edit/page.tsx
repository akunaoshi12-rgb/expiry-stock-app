import { ExpiryEdit } from "@/components/expiry-edit";

interface EditExpiryPageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export default async function EditExpiryPage({ params }: EditExpiryPageProps) {
  const { batchId } = await params;
  return <ExpiryEdit batchId={batchId} />;
}
