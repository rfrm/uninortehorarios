require_relative 'getter'

class SubjectsGetter < Getter
  def get_subjects(subject_code)
    r = Typhoeus.post "http://guayacan.uninorte.edu.co/registro/resultado_codigo.asp",
                       body: form_values(subject_code)
    subjects = {}
    doc = Nokogiri::HTML(r.body)
    doc.css("div").each do |div|
      data = div.content.strip.split("\n").map(&:strip).reject(&:empty?)
      name = data[0]
      /Materia: (?<code>\w{3}\d{4})/ =~ data[1]
      subjects[code] = name
    end
    subjects
  end

  private

    def form_values(subject_code)
      {'valida' => 'OK', 'mat' => subject_code, 'BtnCodigo' => 'Buscar',
       'datos_periodo' => current_period, 'nom_periodo' => current_period_name}
    end
end

