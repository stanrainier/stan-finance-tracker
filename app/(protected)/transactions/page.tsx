'use client';

import { useEffect, useState } from "react";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransferFundsForm } from "@/components/transactions/TransferFundsForm";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import {
  FaArrowUp,
  FaExchangeAlt,
  FaPlus,
  FaWallet,
} from "react-icons/fa";
import { FiArrowDown, FiArrowDownLeft } from "react-icons/fi";
import { GoArrowUpRight } from "react-icons/go";
import { CiBank } from "react-icons/ci";
import { RiCoinsFill } from "react-icons/ri";
import { IoMdCash } from "react-icons/io";
import { FaCircleQuestion, FaTrash } from "react-icons/fa6";

type Transaction = {
  id: string;
  account_id: string;
  user_id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date_incurred: Timestamp;
  created_at: Timestamp;
  account_name: string;
  payable_name: string;
};

export default function Page() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountOptions, setAccountOptions] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const accountTypeIcons: Record<string, JSX.Element> = {
    Bank: <CiBank className="text-xl text-white" />,
    'E-wallet': <FaWallet className="text-xl text-white" />,
    Savings: <RiCoinsFill className="text-xl text-white" />,
    Cash: <IoMdCash className="text-xl text-white" />,
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsRef, orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const list: Transaction[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    const uniqueAccounts = Array.from(new Set(list.map((t) => t.account_name)));
    setAccountOptions(["All", ...uniqueAccounts]);
    setTransactions(list);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const handleSuccess = () => {
    setShowFormModal(false);
    setShowTransferModal(false);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;

    await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(
    (txn) =>
      (selectedAccount === "All" || txn.account_name === selectedAccount) &&
      (selectedType === "All" || txn.type === selectedType)
  );

  const formatDateKey = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupedByDate: Record<string, Transaction[]> = {};
  filteredTransactions
    .sort((a, b) => {
      const getDate = (entry: Transaction) => {
        const ts = entry.date_incurred ?? entry.created_at;
        return ts instanceof Timestamp ? ts.toDate() : new Date(0);
      };

      return getDate(b).getTime() - getDate(a).getTime();
    })
    .forEach((txn) => {
      const ts = txn.date_incurred ?? txn.created_at;
      const key = formatDateKey(ts);
      if (!groupedByDate[key]) groupedByDate[key] = [];
      groupedByDate[key].push(txn);
    });

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            className="w-full sm:w-auto"
            color="primary"
            onClick={() => {
              setShowTransferModal(false);
              setShowFormModal(true);
            }}
            startContent={<FaPlus />}
          >
            Add Transaction
          </Button>

          <Button
            className="w-full sm:w-auto"
            color="primary"
            onClick={() => {
              setShowFormModal(false);
              setShowTransferModal(true);
            }}
            startContent={<FaExchangeAlt />}
          >
            Transfer Funds
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select
            label="Filter by Account"
            selectedKeys={[selectedAccount]}
            onSelectionChange={(keys) => setSelectedAccount(Array.from(keys)[0] as string)}
            className="w-full sm:w-[200px]"
          >
            {accountOptions.map((accountName) => (
              <SelectItem key={accountName}>{accountName}</SelectItem>
            ))}
          </Select>

          <Select
            label="Filter by Type"
            selectedKeys={[selectedType]}
            onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
            className="w-full sm:w-[200px]"
          >
            {["All", "income", "expense", "transfer"].map((type) => (
              <SelectItem key={type}>{type[0].toUpperCase() + type.slice(1)}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)}>
        <ModalContent>
          <ModalBody className="p-4">
            <AddTransactionForm onSuccess={handleSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)}>
        <ModalContent>
          <ModalBody className="p-4">
            <TransferFundsForm onSuccess={handleSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Divider className="my-8" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-8">Your Transactions</h2>

        {loading ? (
          <p>Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 mt-10 text-center text-muted-foreground">
            <FaCircleQuestion size={42} />
            <p className="italic">
              No transactions found
              {(selectedAccount !== "All" || selectedType !== "All") && " with current filters"}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, txns]) => (
              <div key={date}>
                <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">{date}</h3>
                <ul className="space-y-4">
                  {txns.map((txn) => renderTxn(txn))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );

function renderTxn(txn: Transaction) {
  const isTransfer = txn.type === "transfer";
  const isSender = isTransfer && txn.category.toLowerCase().includes("sender");
  const isReceiver = isTransfer && txn.category.toLowerCase().includes("receiver");

  return (
    <li
      key={txn.id}
      className={`shadow-xl/30 hover:shadow-xl/80 hover:scale-[1.03] transition-all duration-1000 transform p-4 rounded-xl shadow-sm border flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center ${
        txn.type === "income"
          ? "bg-green-50 border-green-200"
          : txn.type === "expense"
          ? "bg-red-50 border-red-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      {/* Left content (Icon + details) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 flex-1">
        {/* Category Icon */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 mb-2 sm:mb-0">
          {accountTypeIcons[txn.category] || <IoMdCash className="text-xl text-white" />}
        </div>

        {/* Transaction Details */}
        <div className="space-y-1 text-sm text-black">
          <p className="font-semibold text-lg">{txn.account_name || txn.payable_name}</p>
          <p className="italic text-md">{txn.category}</p>
          <p className="text-md">{txn.description}</p>
          <p className="text-xs text-black">
            {(txn.date_incurred ?? txn.created_at)?.toDate().toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            })}
          </p>
        </div>
      </div>

      {/* Right content (icon + amount + delete) */}
      <div className="flex flex-row sm:flex-col items-end sm:items-center justify-between gap-2 sm:gap-1 text-right sm:text-center">
        {/* Arrow Icon + Amount */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              txn.type === "income"
                ? "bg-green-200"
                : txn.type === "expense"
                ? "bg-red-200"
                : "bg-blue-200"
            }`}
          >
            {txn.type === "income" ? (
              <FaArrowUp className="w-4 h-4 text-green-700" />
            ) : txn.type === "expense" ? (
              <FiArrowDown className="w-4 h-4 text-red-700" />
            ) : isSender ? (
              <GoArrowUpRight className="w-4 h-4 text-red-700" />
            ) : isReceiver ? (
              <FiArrowDownLeft className="w-4 h-4 text-green-700" />
            ) : (
              <FaExchangeAlt className="w-4 h-4 text-blue-700" />
            )}
          </div>

          <span
            className={`text-lg font-bold ${
              txn.type === "income"
                ? "text-green-600"
                : txn.type === "expense"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {txn.type === "income"
              ? "+₱"
              : txn.type === "expense"
              ? "-₱"
              : "₱"}
            {txn.amount.toFixed(2)}
          </span>
        </div>

        {/* Delete Button */}
 <div className="self-end sm:self-end">
          <Button
            isIconOnly
            color="danger"
            variant="ghost"
            onClick={() => handleDelete(txn.id)}
            title="Delete Transaction"
            className="text-sm text-red-500 hover:text-red-800 mt-1 flex items-center gap-1 border border-red-500 px-2 py-1"
          >
            <FaTrash />
          </Button>
        </div>
      </div>
    </li>
  );
}


}
