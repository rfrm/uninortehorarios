module HomeHelper
  def home_link
    if Rails.env.production?
      link_to image_tag('logo_small.png', class: 'logo-small'), "http://adf.ly/1TO5C3", id: "home_link"
    else
      link_to image_tag('logo_small.png', class: 'logo-small'), :root
    end
  end

  def generate_link
    if Rails.env.production?
      link_to 'Horarios', "http://adf.ly/1TO5Nu", class: 'btn btn-primary btn-lg goto', style: "margin-right: 15px;", id: "generate_link"
    else
      link_to 'Horarios', home_generate_path, class: 'btn btn-primary btn-lg goto', style: "margin-right: 15px;"
    end
  end

  def teachers_link
    link_to 'Profesores', 'http://adf.ly/1TO84f', class: 'btn btn-primary btn-lg goto', target: :blank, id: "teachers_link"
  end
end

