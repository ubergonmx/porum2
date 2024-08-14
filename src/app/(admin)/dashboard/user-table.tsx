import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/db/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import UserActions from "./user-actions";

interface UserTableProps {
  users?: User[];
}

export default async function UserTable({ users }: UserTableProps) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Users</CardTitle>
        <CardDescription>List of Porum users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden sm:table-cell">First Name</TableHead>
              <TableHead className="hidden sm:table-cell">Last Name</TableHead>
              <TableHead className="hidden sm:table-cell">Phone #</TableHead>
              <TableHead className="hidden sm:table-cell">Password</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.username}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.email.length > 20 ? (
                      <>
                        {/* Shorten super long emails (20 characters) */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {user.email.slice(0, 20)}...
                            </TooltipTrigger>

                            {/* Tooltip wraps because email is long */}
                            <TooltipContent className="w-60 whitespace-normal text-wrap break-words rounded-md bg-background p-2 shadow-md">
                              <div>{user.email}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      user.email
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.firstName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.lastName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {/* Tooltip provides full password, shows only first 5 */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {user.password.slice(0, 5)}...
                        </TooltipTrigger>

                        {/* Tooltip wraps because password is long */}
                        <TooltipContent className="w-60 whitespace-normal text-wrap break-words rounded-md bg-background p-2 shadow-md">
                          <div>{user.password}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.role !== "admin" && (
                      <UserActions userId={user.id} username={user.username} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell>
                  <div className="font-medium">TestUser</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  Tester@Test.com
                </TableCell>
                <TableCell className="hidden sm:table-cell">Admin</TableCell>
                <TableCell className="hidden sm:table-cell">
                  First Test
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  Last Test
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  +63 917 356 2345
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  4WhDg82AljbiO12938W
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
