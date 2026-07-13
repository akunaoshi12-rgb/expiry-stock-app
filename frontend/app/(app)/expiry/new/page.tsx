import { ExpiryForm } from "@/components/expiry-form";

export default function NewExpiryPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-primary">Tambah data expired</p>
          <h2 className="mt-1 text-2xl font-semibold text-text md:text-3xl">Catat batch baru</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Cari produk dari master produk, lalu isi tanggal diterima, tanggal expired, dan sisa stok.
          </p>
        </div>

        <ExpiryForm />
      </section>

      <aside className="space-y-3 xl:pt-16">
        <div className="rounded-lg border border-border bg-surface-soft/70 p-4">
          <h3 className="font-semibold text-text">Prioritas input</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Produk, tanggal expired, dan stok adalah data wajib. Field lain cukup diisi jika membantu audit rak.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-white/70 p-4">
          <h3 className="font-semibold text-text">Jalur penyimpanan</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Data dikirim ke FastAPI dan dicatat pada database berdasarkan produk master yang dipilih.
          </p>
        </div>
      </aside>
    </div>
  );
}
