import { CreateRoundFundingForm } from "@/components/allot/CreateRoundFundingForm";
import { Vault } from "lucide-react";

export default function NewRoundPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Vault className="w-5 h-5 text-[#f0c040]" />
          <h1 className="text-2xl font-bold text-[#f0f4f8]">Create Allocation Round</h1>
        </div>
        <p className="text-sm text-[#475569]">
          Define your policy, set parameters, and deposit GEN into escrow. GenLayer will judge the allocations.
        </p>
      </div>
      <CreateRoundFundingForm />
    </div>
  );
}
