"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { turmaSchema, TurmaFormData } from "@/schemas/turmaSchema";

interface TurmaFormProps {
  onSubmit: (data: TurmaFormData) => Promise<void>;
  defaultValues?: TurmaFormData;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function TurmaForm({
  onSubmit,
  defaultValues,
  loading = false,
  children,
}: TurmaFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TurmaFormData>({
    resolver: zodResolver(turmaSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >

      <div>
        <label
          htmlFor="nome"
          className="block mb-2"
        >
          Nome da turma
        </label>
        <input
          id="nome"
          type="text"
          {...register("nome")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-[#166534] transition"
        />
        {errors.nome && (
          <p className="mt-1 text-sm text-red-600">
            {errors.nome.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="curso"
          className="block mb-2"
        >
          Curso
        </label>
        <input
          id="curso"
          type="text"
          {...register("curso")}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-[#166534] transition"
        />
        {errors.curso && (
          <p className="mt-1 text-sm text-red-600">
            {errors.curso.message}
          </p>
        )}
      </div>

      {children}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#166534] py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>

    </form>
  );
}