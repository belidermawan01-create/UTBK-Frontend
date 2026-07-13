import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Flag, Globe } from "lucide-react";
import { getPtnList } from "../api/api";
import harvardDefault from "../assets/harvard.jpg";

export default function InfoPtn() {
  const [ptnList, setPtnList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPtn = async () => {
      setLoading(true);
      try {
        const ptnRes = await getPtnList();
        setPtnList(ptnRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPtn();
  }, []);

  const filteredPtn = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ptnList;

    return ptnList.filter((ptn) => {
      const ptnText =
        `${ptn.nama} ${ptn.singkatan} ${ptn.provinsi} ${ptn.tipe} ${ptn.akreditasi} ${ptn.deskripsi || ""}`.toLowerCase();
      return ptnText.includes(query);
    });
  }, [search, ptnList]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Info PTN & Jurusan</h1>
            <p className="page-sub">
              Jelajahi daftar Perguruan Tinggi Negeri dan jurusan unggulan untuk
              membantu pilihanmu.
            </p>
          </div>
        </div>

        <div className="ptn-search-panel">
          <div className="ptn-search-input">
            <Search size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari PTN atau jurusan..."
            />
          </div>
          <div className="ptn-search-summary">
            {loading
              ? "Memuat daftar PTN..."
              : `${filteredPtn.length} PTN ditemukan`}
          </div>
        </div>

        {loading ? (
          <div className="full-center" style={{ minHeight: 280 }}>
            <div className="spinner" />
          </div>
        ) : filteredPtn.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada PTN yang cocok</h3>
            <p>Coba kata kunci lain atau hilangkan filter pencarian.</p>
          </div>
        ) : (
          <div className="ptn-grid">
            {filteredPtn.map((ptn) => (
              <Link
                key={ptn.id}
                to={`/info-ptn/${ptn.id}`}
                className="ptn-card-link"
              >
                <article className="ptn-card">
                  <div
                    className="ptn-card-image"
                    style={{
                      backgroundImage: `url(${ptn.logoUrl || harvardDefault})`,
                    }}
                  >
                    <div className="ptn-card-label">
                      <span>{ptn.singkatan || "-"}</span>
                    </div>
                  </div>

                  <div className="ptn-card-body">
                    <div className="ptn-card-header">
                      <div>
                        <h2>{ptn.nama}</h2>
                        <p>
                          {ptn.deskripsi
                            ? `${ptn.deskripsi.slice(0, 140)}${ptn.deskripsi.length > 140 ? "..." : ""}`
                            : "Deskripsi PTN tidak tersedia."}
                        </p>
                      </div>
                    </div>

                    <div className="ptn-card-meta">
                      <span>
                        <MapPin size={14} /> {ptn.kota}, {ptn.provinsi}
                      </span>
                      <span>
                        <Globe size={14} /> {ptn.tipe}
                      </span>
                      <span>
                        <Flag size={14} /> {ptn.akreditasi || "-"}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
