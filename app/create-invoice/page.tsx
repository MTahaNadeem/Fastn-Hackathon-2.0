import { redirect } from "next/navigation";

export default function CreateInvoiceRedirect() {
  redirect("/invoices/create");
}
