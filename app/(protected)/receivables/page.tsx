"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { FaCalendarCheck } from "react-icons/fa";

export default function ReceivablesPage() {
  const receivables = [
    {
      id: 1,
      name: "Client A Invoice",
      amount: 5000,
      expectedDate: "2025-07-20",
      issuedDate: "2025-07-05",
    },
    {
      id: 2,
      name: "Freelance Project",
      amount: 7500,
      expectedDate: "2025-07-22",
      issuedDate: "2025-07-06",
    },
    {
      id: 3,
      name: "Product Sale",
      amount: 1500,
      expectedDate: "2025-07-25",
      issuedDate: "2025-07-08",
    },
  ];

  const total = receivables.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Receivables</h1>
        <Card className="shadow-sm w-max mx-auto">
        <CardBody className="flex justify-between">
            <p className="text-muted-foreground text-sm">
            Total Receivables:{" "}
            <span className="font-semibold text-green-600">
                ₱{total.toFixed(2)}
            </span>
            </p>
        </CardBody>
        </Card>

      </div>

      <div className="space-y-4">
        {receivables.map((receivable) => (
          <Card key={receivable.id} className="shadow-sm hover:shadow-md transition">
            <CardBody className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">{receivable.name}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaCalendarCheck className="text-gray-500" size={14} />
                  Issued: {receivable.issuedDate}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaCalendarCheck className="text-gray-500" size={14} />
                  Expected: {receivable.expectedDate}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <p className="text-lg font-bold text-green-600">
                  ₱{receivable.amount.toFixed(2)}
                </p>
                <Button color="primary" variant="flat">
                  Mark as Received
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
