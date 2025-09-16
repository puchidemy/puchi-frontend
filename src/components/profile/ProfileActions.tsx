"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteUserAccount } from "@/services/user.service";
import { useAuthToken } from "@/hooks/useAuthToken";
import { toast } from "sonner";
import {
  AlertTriangle,
  Trash2,
  LogOut,
  Settings,
  Shield,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const ProfileActions = () => {
  const t = useTranslations("ProfileActions");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { getAuthHeaders } = useAuthToken();

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error(t("deleteAccount.error.confirmationRequired"));
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount(getAuthHeaders);
      toast.success(t("deleteAccount.success"));
      setIsDeleteDialogOpen(false);
      // Redirect sẽ được xử lý bởi Clerk
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("deleteAccount.error.general"));
    } finally {
      setIsDeleting(false);
    }
  };

  const actionItems = [
    {
      title: t("actions.accountSettings.title"),
      description: t("actions.accountSettings.description"),
      icon: Settings,
      onClick: () => {
        // Navigate to settings
        window.location.href = "/settings";
      },
    },
    {
      title: t("actions.security.title"),
      description: t("actions.security.description"),
      icon: Shield,
      onClick: () => {
        // Navigate to security settings
        window.location.href = "/settings/security";
      },
    },
    {
      title: t("actions.signOut.title"),
      description: t("actions.signOut.description"),
      icon: LogOut,
      isSignOut: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Các hành động thông thường */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {t("actions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionItems.map((item, index) => (
            <div key={index}>
              {item.isSignOut ? (
                <SignOutButton>
                  <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </SignOutButton>
              ) : (
                <div
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={item.onClick}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Khu vực nguy hiểm */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{t("dangerZone.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors group">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-10 w-10 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      {t("dangerZone.deleteAccount.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("dangerZone.deleteAccount.description")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span>{t("deleteAccount.dialog.title")}</span>
                </DialogTitle>
                <DialogDescription>
                  {t("deleteAccount.dialog.description")}
                  <br />
                  <br />
                  {t.rich("deleteAccount.dialog.confirmation", {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  {t("deleteAccount.dialog.confirmationLabel")}
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t(
                    "deleteAccount.dialog.confirmationPlaceholder"
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  {t("deleteAccount.dialog.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== "DELETE"}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t("deleteAccount.dialog.deleting")}
                    </>
                  ) : (
                    t("deleteAccount.dialog.confirm")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileActions;
