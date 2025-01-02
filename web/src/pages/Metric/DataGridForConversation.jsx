"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/components/ui/dropdown-menu";
import { Button } from "@/components/components/ui/button";

const DataGridForConversation = ({
  conversations,
  onDelete,
  onPreview,
  handleStartConversation,
}) => {
  const columns = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const conversation = row.original;
        return <span className="font-medium">{conversation.title}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const conversation = row.original;
        return new Date(conversation.createdAt).toLocaleString();
      },
    },
    {
      accessorKey: "fileCount",
      header: "Files",
      cell: ({ row }) => {
        const conversation = row.original;
        return `${conversation.fileIds.length} file(s)`;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const conversation = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDelete(conversation._id)}>
                Delete Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(conversation)}>
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStartConversation(conversation)}
              >
                Start Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: conversations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No Metric Available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataGridForConversation;
