import Loading from '@/components/common/Loading';
import { useGetDive } from '../hooks/useGetDive';
import GoBack from '@/components/ui/GoBack';

function DiveDetails() {
  const { dive, isLoading, error } = useGetDive();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dive) {
    return <div>Error loading dive details.</div>;
  }

  return (
    <div>
      <GoBack />
    </div>
  );
}

export default DiveDetails;
