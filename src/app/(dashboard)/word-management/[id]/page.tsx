import EditWordForm from "./_components/edit-word";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;

  console.log(resolvedParams)
  return (
    <div>
      <EditWordForm wordId={resolvedParams.id} />
    </div>
  );
};

export default Page;