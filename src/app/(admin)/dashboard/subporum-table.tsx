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
import SubporumActions from "./subporum-actions";

interface SubporumTableProps {
  subporums?: any[];
}

export default async function SubporumTable({ subporums }: SubporumTableProps) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Subporums</CardTitle>
        <CardDescription>List of all subporums.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden sm:table-cell">Creator</TableHead>
              <TableHead className="hidden sm:table-cell">
                Minimum Days
              </TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subporums && subporums.length > 0 ? (
              subporums.map((subporum) => (
                <TableRow key={subporum.id}>
                  <TableCell>
                    <div className="font-medium">{subporum.name}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subporum.description || "No description"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subporum.creator.username}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subporum.minimumDays}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subporum.createdAt
                      ? new Date(subporum.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <SubporumActions
                      subporumId={subporum.id}
                      subporumName={subporum.name}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell colSpan={6} className="text-center">
                  No subporums found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
