import { supabase } from "@/lib/supabase";
import { useEmployee } from "../contexts/EmployeeContext";


export default function ShiftsPage() {
  const { employee, loading } = useEmployee()

  
    
  return (
    <div>
      <h1 className="text-3xl font-bold">
        My Shifts
      </h1>
    </div>
  )
}