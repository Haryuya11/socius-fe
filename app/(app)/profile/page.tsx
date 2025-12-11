"use client";
import {
  Mail,
  Briefcase,
  Users,
  DollarSign,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { UserProfile } from "@/types/user";
import { getAvatarInfo } from "@/utils/avatar-utils";


export default function ProfilePage() {
  const { user } = useAuth();
  const { fullName, initials, avatarUrl } = getAvatarInfo(user as UserProfile);

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        {/* Hero Card with profile info */}
        <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-primary/0 to-transparent overflow-hidden mb-8 shadow-lg">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-8">
              <Avatar className="h-24 w-24 border-3 border-primary/20 shadow-md">
                <AvatarImage
                  src={avatarUrl || "/placeholder.svg"}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                  {fullName}
                </h2>
                <p className="text-muted-foreground mb-4 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.userId}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.systemRole}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Information */}
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Client ID
                  </p>
                  <p className="text-sm font-mono text-foreground bg-secondary/40 px-3 py-2 rounded-md break-all">
                    {user?.clientId}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Role
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.systemRole}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Compensation */}
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Compensation
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Annual Salary
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {user?.salary}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Departments */}
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Departments
              </h3>
              <div className="space-y-3">
                {user?.departments && user?.departments.length > 0 ? (
                  user?.departments.map((dept) => (
                    <div
                      key={dept.departmentCode}
                      className="border-l-2 border-primary/30 pl-4 py-2"
                    >
                      <p className="font-medium text-foreground">
                        {dept.departmentName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dept.roleName}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {dept.departmentCode}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No departments assigned
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Teams */}
          <Card className="border-border/50 hover:border-primary/30 transition-colors">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teams
              </h3>
              <div className="space-y-3">
                {user?.teams && user?.teams.length > 0 ? (
                  user?.teams.map((team) => (
                    <div
                      key={team.teamCode}
                      className="border-l-2 border-primary/30 pl-4 py-2"
                    >
                      <p className="font-medium text-foreground">
                        {team.teamName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {team.roleName}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {team.teamCode}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No teams assigned
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
          <Link href="/settings" className="flex-1">
            <Button className="w-full">Edit Profile</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
