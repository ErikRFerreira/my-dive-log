import InlineSpinner from '@/components/common/InlineSpinner';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDeleteAccount } from '@/features/authentication/hooks/useDeleteAccount';
import { TriangleAlert } from 'lucide-react';

function DangerZone() {
  const { deleteAccount, isPending } = useDeleteAccount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TriangleAlert className="text-destructive" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
            >
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                This action is permanent. Your account and all related data will be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                className="text-white"
                onClick={() => deleteAccount()}
                disabled={isPending}
              >
                Delete
                {isPending && <InlineSpinner />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default DangerZone;
