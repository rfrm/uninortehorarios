require_relative 'getter'

class CodeGetter < Getter
  include Celluloid

  def get_code(nrc)
    r = Typhoeus.post "http://guayacan.uninorte.edu.co/registro/resultado_nrc.asp", body: form_values(nrc)
    doc = Nokogiri::HTML(r.body)
    /Materia: (?<code>\w{3})\d{4}/ =~ doc.text
    puts "Got #{nrc}: #{code}"
    code
  end

  private

    def form_values(nrc)
      {'valida' => 'OK', 'nrc' => nrc, 'BtnNRC' => 'Buscar',
       'datos_periodo' => current_period, 'nom_periodo' => current_period_name}
    end
end

