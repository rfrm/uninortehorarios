module HomeHelper
  def home_link
    link_to image_tag('logo_small.png', class: 'logo-small'), :root
  end

  def generate_link
    link_to 'Horarios', home_generate_path, class: 'btn btn-primary btn-lg goto', style: "margin-right: 15px;"
  end

  def teachers_link
    link_to 'Profesores', 'http://linku-docentes.bitballoon.com/', class: 'btn btn-primary btn-lg goto', target: :blank
  end
end

