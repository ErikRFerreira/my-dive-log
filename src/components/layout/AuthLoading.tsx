import Loading from '@/components/common/Loading';

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <Loading />
    </div>
  );
}

export default AuthLoading;
