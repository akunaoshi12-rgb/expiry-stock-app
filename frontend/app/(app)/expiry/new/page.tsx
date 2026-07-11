import { ExpiryForm } from "@/components/expiry-form";

export default function NewExpiryPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Tambah data expired</p>
          <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">Catat batch baru</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Cari produk dari master produk, lalu isi tanggal diterima, tanggal expired, dan sisa stok.
          </p>
        </div>

        <div className="card p-5">
          <ExpiryForm />
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h3 className="font-semibold text-text">Alur pencatatan</h3>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <li>1. Cari produk memakai nama atau barcode.</li>
            <li>2. Pilih produk yang sesuai dari dropdown.</li>
            <li>3. Isi tanggal expired dan sisa stok.</li>
            <li>4. Simpan untuk melihat feedback sukses.</li>
          </ol>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-text">Tersimpan ke database</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Batch yang disimpan dari halaman ini akan dikirim ke API production dan dicatat pada database berdasarkan
            produk master yang dipilih.
          </p>
        </div>
      </aside>
    </div>
  );
}
