"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { FaCalendarAlt } from "react-icons/fa";

export default function PayablesPage() {
  const payables = [
    {
      id: 1,
      name: "Electric Bill",
      amount: 1200,
      dueDate: "2025-07-25",
      incurredDate: "2025-07-10",
    },
    {
      id: 2,
      name: "Water Bill",
      amount: 850,
      dueDate: "2025-07-22",
      incurredDate: "2025-07-08",
    },
    {
      id: 3,
      name: "Credit Card Payment",
      amount: 3000,
      dueDate: "2025-07-30",
      incurredDate: "2025-07-01",
    },
  ];

  const total = payables.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Payables</h1>
       <Card className="shadow-sm w-max mx-auto">
        <CardBody>
            <p className="text-muted-foreground text-sm">
            Total Payables:{" "}
            <span className="font-semibold text-red-600">
                ₱{total.toFixed(2)}
            </span>
            </p>
        </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        {payables.map((payable) => (
          <Card key={payable.id} className="shadow-sm hover:shadow-md transition">
            <CardBody className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">{payable.name}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-500" size={14} />
                  Incurred: {payable.incurredDate}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-500" size={14} />
                  Due: {payable.dueDate}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <p className="text-lg font-bold text-red-600">
                  ₱{payable.amount.toFixed(2)}
                </p>
                <Button color="success" variant="flat">
                  Mark as Paid
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
