import Loading from '@/components/common/Loading';
import { useGetDive } from '../hooks/useGetDive';

function DiveDetails() {
  const { dive, isLoading, error } = useGetDive();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dive) {
    return <div>Error loading dive details.</div>;
  }

  console.log(dive);

  return <div>DiveDetails</div>;
}

export default DiveDetails;
