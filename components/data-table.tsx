"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import * as React from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    handleCellClickCb?: (rowData: any) => void
    clickableColumns?: string[]
    disableRowClick?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    handleCellClickCb,
    clickableColumns,
    disableRowClick = false
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const handleCellClick = (e: React.MouseEvent, cell: any, row: any) => {
        if (clickableColumns && clickableColumns.length > 0) {
            const columnId = cell.column.id
            if (clickableColumns.includes(columnId)) {
                e.stopPropagation()
                handleCellClickCb?.(row.original)
            }
        }
    }

    const handleRowClick = (row: any) => {
        if (!disableRowClick && (!clickableColumns || clickableColumns.length === 0)) {
            handleCellClickCb?.(row.original)
        }
    }

    return (
        <div>
            <div className="rounded-md border mb-5">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => handleRowClick(row)}
                                    className={(!disableRowClick && (!clickableColumns || clickableColumns.length === 0)) ? "cursor-pointer" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const isClickableColumn = clickableColumns?.includes(cell.column.id)
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                onClick={(e) => handleCellClick(e, cell, row)}
                                                className={isClickableColumn ? "cursor-pointer" : ""}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table}/>
        </div>
    )
}