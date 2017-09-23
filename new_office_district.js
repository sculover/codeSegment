<?php $types = array(
	array("id"=>2, "value"=>"联合办公"),
	array("id"=>3, "value"=>"超级办公室"),
) ?>
<?php foreach($types as $key => $value) {
	echo '<dd class="new-office-list-filter-value ev-new-office-list-district-value"> <input type="checkbox" name="new_office_district_filter" id="district'.$value['id'].'" value="'.$value['id'].'"><label for="district'.$value['id'].'"><span>'.$value['value'].'</span></label></dd>';
}?>